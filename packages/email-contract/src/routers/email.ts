import { array } from 'valibot'
import { orpc } from '../orpc'
import { EmailListQueryInputSchema, EmailSchema, EmailSendBodyInputSchema } from '../schemas/email'

export const emailSendRoute = orpc
  .route({
    method: 'POST',
    path: '/',
    summary: 'Send an email',
  })
  .body(EmailSendBodyInputSchema)
  .response({
    status: 201,
    body: EmailSchema,
  })

export const emailSendBatchRoute = orpc
  .route({
    method: 'POST',
    path: '/batch',
    summary: 'Batch send emails',
  })
  .body(array(EmailSendBodyInputSchema))
  .response({
    status: 201,
    body: array(EmailSchema),
  })

export const emailListRoute = orpc
  .route({
    method: 'GET',
    path: '/',
    summary: 'List emails',
  })
  .query(EmailListQueryInputSchema)
  .response({
    status: 200,
    body: array(EmailSchema),
  })

export const emailRouter = orpc.router({
  send: emailSendRoute,
  sendBatch: emailSendBatchRoute,
  list: emailListRoute,
})
