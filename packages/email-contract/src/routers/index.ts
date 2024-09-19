import { orpc } from '../orpc'
import { emailRouter } from './email'
import { identityRouter } from './identity'

export const routerContract = orpc.router({
  identity: identityRouter.prefix('/identities'),
  email: emailRouter.prefix('/emails'),
})
