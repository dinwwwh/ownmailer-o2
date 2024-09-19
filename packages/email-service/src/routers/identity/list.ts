import { orpc } from '../../orpc'

export const identityListRoute = orpc.identity.list.handler(async () => {
  // TODO:
  return {
    status: 200,
    body: [],
  }
})
