/* eslint-disable */
import type {
    AnyRootConfig,
    CreateRouterInner,
    ProcedureBuilder,
    ProcedureParams,
    ProcedureRouterRecord,
    unsetMarker
} from "@trpc/server";
import type {PrismaClient} from ".prisma/client";
import createUserRouter from "./User.router";
import createSessionRouter from "./Session.router";

export type BaseConfig = AnyRootConfig;

export type RouterFactory<Config extends BaseConfig> = <
    ProcRouterRecord extends ProcedureRouterRecord
>(
    procedures: ProcRouterRecord
) => CreateRouterInner<Config, ProcRouterRecord>;

export type UnsetMarker = typeof unsetMarker;

export type ProcBuilder<Config extends BaseConfig> = ProcedureBuilder<
    ProcedureParams<Config, any, any, any, UnsetMarker, UnsetMarker, any>
>;

export function db(ctx: any) {
    if (!ctx.prisma) {
        throw new Error('Missing "prisma" field in trpc context');
    }
    return ctx.prisma as PrismaClient;
}

export function createRouter<Config extends BaseConfig>(router: RouterFactory<Config>, procedure: ProcBuilder<Config>) {
    return router({
        user: createUserRouter(router, procedure),
        session: createSessionRouter(router, procedure),
    }
    );
}
