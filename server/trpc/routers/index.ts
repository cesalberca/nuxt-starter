import { userRouter } from "~/server/trpc/routers/user";
import { router } from "~/server/trpc/trpc";

export const appRouter = router({
  user: userRouter,
});

export type AppRouter = typeof appRouter;
