import type { inferAsyncReturnType } from "@trpc/server";
import type { H3Event } from "h3";

export const createContext = async (event: H3Event) => {
  return { user: event.context.user };
};

export type Context = inferAsyncReturnType<typeof createContext>;
