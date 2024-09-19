import { InferOutput, literal, object, string, union } from 'valibot'

export type IdentityVerificationStatus = InferOutput<typeof IdentityVerificationStatusSchema>
export type Identity = InferOutput<typeof IdentitySchema>

export const IdentityVerificationStatusSchema = union([
  literal('failed'),
  literal('not_started'),
  literal('pending'),
  literal('success'),
  literal('temporary_failure'),
])

export const IdentitySchema = object({
  identity: string(),
  status: IdentityVerificationStatusSchema,
})
