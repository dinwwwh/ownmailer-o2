import { orpc } from '../orpc'
import { identityListRoute } from './identity/list'

export const appRouter = orpc.router({
  identity: {
    list: identityListRoute,
  },

  email: {} as any, // TODO:
})
