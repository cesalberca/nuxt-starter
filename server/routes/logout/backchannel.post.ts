import { createError, defineEventHandler, readValidatedBody, sendNoContent } from "h3";
import { z } from "zod";

import { logger } from "~/server/utils/logger";
import { prisma } from "~/server/utils/prisma";

const bodySchema = z.object({
  logout_token: z.string(),
});

// OpenID Connect Back-Channel Logout 1.0 endpoint
// See: https://openid.net/specs/openid-connect-backchannel-1_0.html
export default defineEventHandler(async (event) => {
  const { lucia, oidc } = event.context;

  let payload;
  try {
    const body = await readValidatedBody(event, (body) => bodySchema.parse(body));
    payload = await oidc.validateBackchannelLogoutToken(body.logout_token);
  } catch (error) {
    logger.error(error, "Back-channel logout token validation error");
    throw createError({
      statusCode: 400,
    });
  }

  if (payload.sid) {
    const sessions = await prisma.session.findMany({
      where: { sid: payload.sid },
      select: { id: true },
    });
    for (const session of sessions) {
      await lucia.invalidateSession(session.id);
    }
    return sendNoContent(event);
  }

  if (payload.sub) {
    const user = await prisma.user.findUnique({
      where: { sub: payload.sub },
      select: { id: true },
    });
    if (user) {
      await lucia.invalidateUserSessions(user.id);
    }
    return sendNoContent(event);
  }
});
