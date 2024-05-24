/* eslint-disable */
import { type RouterFactory, type ProcBuilder, type BaseConfig, db } from ".";
import * as _Schema from '@zenstackhq/runtime/zod/input';
const $Schema: typeof _Schema = (_Schema as any).default ?? _Schema;
import { checkRead, checkMutate } from '../helper';

export default function createRouter<Config extends BaseConfig>(router: RouterFactory<Config>, procedure: ProcBuilder<Config>) {
    return router({

        aggregate: procedure.input($Schema.SessionInputSchema.aggregate).query(({ ctx, input }) => checkRead(db(ctx).session.aggregate(input as any))),

        createMany: procedure.input($Schema.SessionInputSchema.createMany).mutation(async ({ ctx, input }) => checkMutate(db(ctx).session.createMany(input as any))),

        create: procedure.input($Schema.SessionInputSchema.create).mutation(async ({ ctx, input }) => checkMutate(db(ctx).session.create(input as any))),

        deleteMany: procedure.input($Schema.SessionInputSchema.deleteMany).mutation(async ({ ctx, input }) => checkMutate(db(ctx).session.deleteMany(input as any))),

        delete: procedure.input($Schema.SessionInputSchema.delete).mutation(async ({ ctx, input }) => checkMutate(db(ctx).session.delete(input as any))),

        findFirst: procedure.input($Schema.SessionInputSchema.findFirst).query(({ ctx, input }) => checkRead(db(ctx).session.findFirst(input as any))),

        findFirstOrThrow: procedure.input($Schema.SessionInputSchema.findFirst).query(({ ctx, input }) => checkRead(db(ctx).session.findFirstOrThrow(input as any))),

        findMany: procedure.input($Schema.SessionInputSchema.findMany).query(({ ctx, input }) => checkRead(db(ctx).session.findMany(input as any))),

        findUnique: procedure.input($Schema.SessionInputSchema.findUnique).query(({ ctx, input }) => checkRead(db(ctx).session.findUnique(input as any))),

        findUniqueOrThrow: procedure.input($Schema.SessionInputSchema.findUnique).query(({ ctx, input }) => checkRead(db(ctx).session.findUniqueOrThrow(input as any))),

        groupBy: procedure.input($Schema.SessionInputSchema.groupBy).query(({ ctx, input }) => checkRead(db(ctx).session.groupBy(input as any))),

        updateMany: procedure.input($Schema.SessionInputSchema.updateMany).mutation(async ({ ctx, input }) => checkMutate(db(ctx).session.updateMany(input as any))),

        update: procedure.input($Schema.SessionInputSchema.update).mutation(async ({ ctx, input }) => checkMutate(db(ctx).session.update(input as any))),

        upsert: procedure.input($Schema.SessionInputSchema.upsert).mutation(async ({ ctx, input }) => checkMutate(db(ctx).session.upsert(input as any))),

        count: procedure.input($Schema.SessionInputSchema.count).query(({ ctx, input }) => checkRead(db(ctx).session.count(input as any))),

    }
    );
}
