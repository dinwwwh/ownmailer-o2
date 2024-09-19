import { initORPCServer } from '@orpc/server'
import { routerContract } from '@ownmailer/email-contract'

export interface ORPCContext {}

export const orpc = initORPCServer.context<ORPCContext>().contract(routerContract)
