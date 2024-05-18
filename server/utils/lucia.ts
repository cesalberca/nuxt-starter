import type { Session, User } from "@prisma/client";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia, TimeSpan } from "lucia";
import { useRuntimeConfig } from "nitropack/runtime/config";

import { prisma } from "~/server/utils/prisma";

const config = useRuntimeConfig();

declare module "lucia" {
  interface Register {
    Lucia: ReturnType<typeof initializeLucia>;
    DatabaseUserAttributes: Pick<User, "sub" | "name" | "email" | "role">;
    DatabaseSessionAttributes: Pick<Session, "sid" | "idToken">;
  }
}

export const initializeLucia = () => {
  const adapter = new PrismaAdapter(prisma.session, prisma.user);
  return new Lucia(adapter, {
    sessionExpiresIn: new TimeSpan(Number.parseInt(config.auth.session.maxAge, 10), "s"),
    sessionCookie: {
      name: config.auth.session.cookieName,
      expires: true,
      attributes: {
        sameSite: "strict",
        path: "/",
        secure: !import.meta.dev,
      },
    },
    getUserAttributes: (attributes) => {
      return {
        sub: attributes.sub,
        name: attributes.name,
        email: attributes.email,
        role: attributes.role,
      };
    },
    getSessionAttributes: (attributes) => {
      return {
        sid: attributes.sid,
        idToken: attributes.idToken,
      };
    },
  });
};
