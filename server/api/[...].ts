import {enhance} from '@zenstackhq/runtime';
import {createEventHandler} from '@zenstackhq/server/nuxt';
import {prisma} from "~/server/utils/prisma";
import type {EventHandlerRequest, H3Event} from "h3";
import { useSession} from "h3";
import {useRuntimeConfig} from "nitropack/runtime/config";

const sessionConfig: any = useRuntimeConfig().auth.session;

export type AuthSession = {
    id: string;
    name: string;
    email: string;
};

export const useAuthSession = async (event: H3Event) => {
    const session = await useSession<AuthSession>(event, sessionConfig);
    return session
};


export default createEventHandler({
    getPrisma: async (event: H3Event<EventHandlerRequest>) => {
        const session = await useAuthSession(event);

        return enhance(prisma, {
            user: session.data.id ? {id: session.data.id} : undefined,
        });
    },
});
