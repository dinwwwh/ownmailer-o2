import { date, isoTimestamp, pipe, string, transform, union } from 'valibot'

export const CoerceDateSchema = union([
  date(),
  pipe(
    string(),
    isoTimestamp(),
    transform((v) => new Date(v))
  ),
])
