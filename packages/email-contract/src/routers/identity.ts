import { array } from 'valibot'
import { orpc } from '../orpc'
import { IdentitySchema } from '../schemas/identity'

export const listIdentityRoute = orpc
  .route({
    method: 'GET',
    path: '/',
    summary: 'List mailer identities',
  })
  .response({
    status: 200,
    body: array(IdentitySchema),
  })

export const identityRouter = orpc.router({
  list: listIdentityRoute,
})
