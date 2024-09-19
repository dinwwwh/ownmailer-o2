import {
  array,
  base64,
  boolean,
  check,
  description,
  InferOutput,
  integer,
  literal,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  optional,
  pipe,
  record,
  string,
  transform,
  union,
  url,
  variant,
} from 'valibot'
import { CoerceDateSchema } from '../schema'
import {
  SESBounceSchema,
  SESClickSchema,
  SESComplaintSchema,
  SESDeliveryDelaySchema,
  SESDeliverySchema,
  SESOpenSchema,
  SESRejectSchema,
  SESSubscriptionSchema,
} from '../ses'

export type EmailScheduledLog = InferOutput<typeof EmailScheduledLogSchema>
export type EmailCancelledLog = InferOutput<typeof EmailCancelledLogSchema>
export type EmailRejectedLog = InferOutput<typeof EmailRejectedLogSchema>
export type EmailSentLog = InferOutput<typeof EmailSentLogSchema>
export type EmailDeliveredLog = InferOutput<typeof EmailDeliveredLogSchema>
export type EmailDelayedLog = InferOutput<typeof EmailDelayedLogSchema>
export type EmailBouncedLog = InferOutput<typeof EmailBouncedLogSchema>
export type EmailComplainedLog = InferOutput<typeof EmailComplainedLogSchema>
export type EmailOpenedLog = InferOutput<typeof EmailOpenedLogSchema>
export type EmailClickedLog = InferOutput<typeof EmailClickedLogSchema>
export type EmailUnsubscribedLog = InferOutput<typeof EmailUnsubscribedLogSchema>
export type EmailLog = InferOutput<typeof EmailLogSchema>
export type EmailStatus = InferOutput<typeof EmailStatusSchema>
export type Email = InferOutput<typeof EmailSchema>
export type EmailSendBodyInput = InferOutput<typeof EmailSendBodyInputSchema>
export type EmailListQueryInput = InferOutput<typeof EmailListQueryInputSchema>

const TimestampSchema = pipe(
  number(),
  integer(),
  minValue(0),
  description('unix timestamp in seconds')
)

export const EmailScheduledLogSchema = object({
  type: literal('scheduled'),
  timestamp: TimestampSchema,
  until: TimestampSchema,
})

export const EmailCancelledLogSchema = object({
  type: literal('cancelled'),
  timestamp: TimestampSchema,
})

export const EmailRejectedLogSchema = object({
  type: literal('rejected'),
  timestamp: TimestampSchema,
  external: SESRejectSchema,
})

export const EmailSentLogSchema = object({
  type: literal('sent'),
  timestamp: TimestampSchema,
})

export const EmailDeliveredLogSchema = object({
  type: literal('delivered'),
  timestamp: TimestampSchema,
  external: SESDeliverySchema,
})

export const EmailDelayedLogSchema = object({
  type: literal('delayed'),
  timestamp: TimestampSchema,
  external: SESDeliveryDelaySchema,
})

export const EmailBouncedLogSchema = object({
  type: literal('bounced'),
  timestamp: TimestampSchema,
  external: SESBounceSchema,
})

export const EmailComplainedLogSchema = object({
  type: literal('complained'),
  timestamp: TimestampSchema,
  external: SESComplaintSchema,
})

export const EmailOpenedLogSchema = object({
  type: literal('opened'),
  timestamp: TimestampSchema,
  external: SESOpenSchema,
})

export const EmailClickedLogSchema = object({
  type: literal('clicked'),
  timestamp: TimestampSchema,
  external: SESClickSchema,
})

export const EmailUnsubscribedLogSchema = object({
  type: literal('unsubscribed'),
  timestamp: TimestampSchema,
  external: SESSubscriptionSchema,
})

export const EmailLogSchema = variant('type', [
  EmailScheduledLogSchema,
  EmailCancelledLogSchema,
  EmailRejectedLogSchema,
  EmailSentLogSchema,
  EmailDeliveredLogSchema,
  EmailDelayedLogSchema,
  EmailBouncedLogSchema,
  EmailComplainedLogSchema,
  EmailOpenedLogSchema,
  EmailClickedLogSchema,
  EmailUnsubscribedLogSchema,
])

export const EmailStatusOrderedList = [
  // the order of the enum is important
  'scheduled', // INTERNAL: The email was scheduled to be sent.
  'cancelled', // INTERNAL: The email was cancelled before it was sent.
  'rejected', // Amazon SES accepted the email, but determined that it contained a virus and didn't attempt to deliver it to the recipient's mail server.
  'sent', // The send request was successful and Amazon SES will attempt to deliver the message to the recipient's mail server. (If account-level or global suppression is being used, SES will still count it as a send, but delivery is suppressed.)
  'delivered', // Amazon SES successfully delivered the email to the recipient's mail server.
  'delayed', // The email couldn't be delivered to the recipient's mail server because a temporary issue occurred. Delivery delays can occur, for example, when the recipient's inbox is full, or when the receiving email server experiences a transient issue.
  'bounced', // A hard bounce that the recipient's mail server permanently rejected the email. (Soft bounces are only included when SES is no longer retrying to deliver the email. Generally these soft bounces indicate a delivery failure, although in some cases a soft bounce can be returned even when the mail reaches the recipient inbox successfully. This typically occurs when the recipient sends an out-of-office automatic reply.
  'complained', // The email was successfully delivered to the recipient's mail server, but the recipient marked it as spam.
  'opened', // The recipient received the message and opened it in their email client.
  'clicked', // The recipient clicked one or more links in the email.
  'unsubscribed', // The email was successfully delivered, but the recipient updated the subscription preferences by clicking List-Unsubscribe in the email header or the Unsubscribe link in the footer.
] as const

export const EmailStatusSchema = union(EmailStatusOrderedList.map(literal))

export const EmailSchema = object({
  id: string(),
  externalId: optional(string()),
  createdAt: CoerceDateSchema,
  updatedAt: CoerceDateSchema,

  from: string(),
  to: pipe(array(string()), minLength(1)),
  bcc: array(string()),
  cc: array(string()),
  replyTo: array(string()),

  subject: string(),
  text: optional(string()),
  html: optional(string()),
  markdown: optional(string()),

  headers: optional(record(string(), string()), () => ({})),
  tags: optional(record(string(), string()), () => ({})),

  logs: optional(array(EmailLogSchema), () => []),
  status: EmailStatusSchema,
})

export const EmailSendBodyInputSchema = object({
  from: string(),
  to: union([
    pipe(
      string(),
      transform((v) => [v])
    ),
    pipe(array(string()), minLength(1)),
  ]),
  bcc: optional(
    union([
      pipe(
        string(),
        transform((v) => [v])
      ),
      array(string()),
    ]),
    () => []
  ),
  cc: optional(
    union([
      pipe(
        string(),
        transform((v) => [v])
      ),
      array(string()),
    ]),
    () => []
  ),
  replyTo: optional(
    union([
      pipe(
        string(),
        transform((v) => [v])
      ),
      array(string()),
    ]),
    () => []
  ),

  subject: string(),
  text: optional(string()),
  html: optional(string()),
  markdown: optional(string()),

  headers: optional(record(string(), string()), () => ({})),
  tags: optional(record(string(), string()), () => ({})),

  attachments: optional(
    array(
      object({
        inline: optional(boolean(), false),
        filename: string(),
        content: union([pipe(string(), base64()), pipe(string(), url())]),
        contentType: optional(string()),
        headers: optional(record(string(), string()), () => ({})),
        cid: optional(string()),
      })
    ),
    () => []
  ),

  scheduledAt: optional(
    pipe(
      CoerceDateSchema,
      check((v) => v.getTime() > Date.now() - 1000 * 60, 'Scheduled at must be in the future')
    )
  ),
})

export const EmailListQueryInputSchema = object({
  limit: optional(pipe(number(), integer(), minValue(1), maxValue(100)), 10),
  cursor: optional(pipe(number(), integer()), 0),
  search: optional(string()),
  status: optional(EmailStatusSchema),
})
