import type { User } from "@prisma/client";
import { appendHeader, createError, defineEventHandler, getCookie, getRequestURL, sendRedirect } from "h3";

import { createId } from "~/server/utils/create-id";
import { logger } from "~/server/utils/logger";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const { lucia, oidc } = event.context;

  const codeVerifier = getCookie(event, oidc.codeVerifierCookieName);
  const state = getCookie(event, oidc.stateCookieName);
  const nonce = getCookie(event, oidc.nonceCookieName);
  if (!codeVerifier || !state || !nonce) {
    logger.error("Missing cookies in authorization callback request");
    throw createError({
      status: 400,
    });
  }

  let tokens, claims;
  try {
    const callbackUrl = getRequestURL(event);
    ({ tokens, claims } = await oidc.validateAuthorizationCallback(callbackUrl, codeVerifier, state, nonce));
  } catch (error) {
    logger.error(error, "Authorization code validation error");
    throw createError({
      status: 400,
    });
  }

  let profile;
  try {
    profile = await oidc.getUserProfile(tokens.accessToken, claims.sub);
  } catch (error) {
    logger.error(error, "User profile retrieval error");
    throw createError({
      status: 500,
    });
  }

  let user;
  try {
    user = await prisma.user.upsert({
      where: {
        sub: profile.sub,
      },
      update: {
        name: profile.name,
        email: profile.email,
        role: profile.role as User["role"],
        refreshToken: tokens.refreshToken,
        refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
      },
      create: {
        id: createId(),
        sub: profile.sub,
        name: profile.name,
        email: profile.email,
        role: profile.role as User["role"],
        refreshToken: tokens.refreshToken,
        refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
      },
    });
  } catch (error) {
    logger.error(error, "User upsert error");
    throw createError({
      status: 500,
    });
  }

  const session = await lucia.createSession(
    user.id,
    { sid: claims.sid as string, idToken: tokens.idToken },
    { sessionId: createId() },
  );
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());

  const parsedState = oidc.parseState(state);
  const redirectUrl = new URL((parsedState?.redirect as string) ?? "/", oidc.rootUrl);

  return sendRedirect(event, redirectUrl.toString());
});
