import { appendHeader, createError, defineEventHandler, getHeader, sendRedirect } from "h3";

import { logger } from "~/server/utils/logger";

// OpenID Connect RP-Initiated Logout 1.0 endpoint
// See: https://openid.net/specs/openid-connect-rpinitiated-1_0.html
export default defineEventHandler(async (event) => {
  const { lucia, oidc, session } = event.context;

  const referer = getHeader(event, "referer");
  if (!referer || new URL(referer).origin !== oidc.rootUrl.origin) {
    logger.error(referer, "Invalid referrer in logout request");
    throw createError({
      statusCode: 400,
    });
  }

  if (!session) {
    throw createError({
      statusCode: 401,
    });
  }

  await lucia.invalidateSession(session.id);
  appendHeader(event, "Set-Cookie", lucia.createBlankSessionCookie().serialize());

  const endSessionUrl = await oidc.createEndSessionUrl(session.idToken);
  const redirectUrl = endSessionUrl ?? oidc.rootUrl;

  return sendRedirect(event, redirectUrl.toString());
});
