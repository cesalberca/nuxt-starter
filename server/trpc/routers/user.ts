import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "~/server/trpc/trpc";
import { prisma } from "~/server/utils/prisma";

export const userRouter = router({
  get: publicProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
  update: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(({ input, ctx }) => {
      return prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          name: input.name,
        },
      });
    }),
});
