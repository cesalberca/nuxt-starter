import type { inferAsyncReturnType } from "@trpc/server";
import type { H3Event } from "h3";
import { enhance } from "@zenstackhq/runtime";

import { prisma } from "~/server/utils/prisma";

export const createContext = async (event: H3Event) => {
  return {
    user: event.context.user,
    ...(event.context.user
      ? {
          prisma: enhance(prisma, {
            user: {
              ...event.context.user,
              id: event.context.user?.id,
            },
          }),
        }
      : {}),
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
