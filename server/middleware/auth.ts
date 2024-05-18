import type { Session, User } from "lucia";
import { appendResponseHeader, defineEventHandler, getCookie } from "h3";

import { initializeLucia } from "~/server/utils/lucia";
import { initializeOIDC } from "~/server/utils/oidc";

let lucia: ReturnType<typeof initializeLucia>;
let oidc: ReturnType<typeof initializeOIDC>;

declare module "h3" {
  interface H3EventContext {
    lucia: typeof lucia;
    oidc: typeof oidc;
    session: Session | null;
    user: User | null;
  }
}

export default defineEventHandler(async (event) => {
  lucia ??= initializeLucia();
  event.context.lucia = lucia;

  oidc ??= initializeOIDC();
  event.context.oidc = oidc;

  const sessionId = getCookie(event, lucia.sessionCookieName);
  if (!sessionId) {
    event.context.session = null;
    event.context.user = null;
    return;
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session?.fresh) {
    appendResponseHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
  }
  if (!session) {
    appendResponseHeader(event, "Set-Cookie", lucia.createBlankSessionCookie().serialize());
  }

  event.context.session = session;
  event.context.user = user;
});
