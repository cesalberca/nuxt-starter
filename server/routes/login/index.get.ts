import { createError, defineEventHandler, getValidatedQuery, sendRedirect, setCookie } from "h3";
import { z } from "zod";

import { logger } from "~/server/utils/logger";

const querySchema = z.object({
  redirect: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const { oidc } = event.context;

  let redirectUrl;
  try {
    const query = await getValidatedQuery(event, (query) => querySchema.parse(query));
    redirectUrl = new URL(query.redirect ?? "/", oidc.rootUrl);
    if (redirectUrl.origin !== oidc.rootUrl.origin) {
      throw new Error("Redirect URL must be within the same origin");
    }
  } catch (error) {
    logger.error(error, "Login request validation error");
    throw createError({
      status: 400,
    });
  }

  const codeVerifier = oidc.generateCodeVerifier();
  const state = oidc.generateState({ redirect: redirectUrl });
  const nonce = oidc.generateNonce();
  const authorizationUrl = await oidc.createAuthorizationUrl(codeVerifier, state, nonce);

  setCookie(event, oidc.codeVerifierCookieName, codeVerifier, {
    path: "/",
    secure: !import.meta.dev,
    httpOnly: true,
    sameSite: "lax",
  });

  setCookie(event, oidc.stateCookieName, state, {
    path: "/",
    secure: !import.meta.dev,
    httpOnly: true,
    sameSite: "lax",
  });

  setCookie(event, oidc.nonceCookieName, nonce, {
    path: "/",
    secure: !import.meta.dev,
    httpOnly: true,
    sameSite: "lax",
  });

  return sendRedirect(event, authorizationUrl.toString());
});
