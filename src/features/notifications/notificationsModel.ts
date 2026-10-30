import { z } from 'zod'
import { PushError } from '@/services/pushes'

export const TITLE_MAX = 100
export const BODY_MAX = 300

// Same limits as the Edge Function (trimmed).
export const pushSchema = z.object({
  title: z.string().trim().min(1).max(TITLE_MAX),
  body: z.string().trim().min(1).max(BODY_MAX),
})

export type PushValues = z.input<typeof pushSchema>

const MESSAGES: Record<string, string> = {
  not_configured: 'Push is not set up on the server yet (FCM_SERVICE_ACCOUNT).',
  send_failed: 'Firebase rejected the notification. Try again.',
  invalid_push: 'Title and message are required.',
  not_admin: "You don't have permission.",
  unauthorized: "You don't have permission.",
}

export function pushErrorMessage(error: unknown): string {
  if (error instanceof PushError) return MESSAGES[error.code] ?? 'Could not send. Try again.'
  return 'Could not send. Try again.'
}
