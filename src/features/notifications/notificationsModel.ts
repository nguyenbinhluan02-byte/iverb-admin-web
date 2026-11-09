import { z } from 'zod'
import { PushError, type Audience, type PushPlatform } from '@/services/pushes'
import type { UserStatus } from '@/services/users'

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
  invalid_audience: 'The recipients filter is not valid.',
  no_recipients: 'No device matches these recipients.',
  not_admin: "You don't have permission.",
  unauthorized: "You don't have permission.",
}

export function pushErrorMessage(error: unknown): string {
  if (error instanceof PushError) return MESSAGES[error.code] ?? 'Could not send. Try again.'
  return 'Could not send. Try again.'
}

export type AudienceMode = 'all' | 'filter' | 'users'

export interface AudienceFilter {
  versions: string[]
  platforms: PushPlatform[]
  statuses: UserStatus[]
}

export const PLATFORMS: { value: PushPlatform; label: string }[] = [
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'iOS' },
]

export const STATUSES: { value: UserStatus; label: string }[] = [
  { value: 'active', label: 'Premium' },
  { value: 'trial', label: 'Trial' },
  { value: 'free', label: 'Free' },
  { value: 'expired', label: 'Expired' },
]

/** What `admin-push` gets: undefined = all users (topic); empty lists left out. */
export function buildAudience(
  mode: AudienceMode,
  filter: AudienceFilter,
  userIds: string[],
): Audience | undefined {
  if (mode === 'all') return undefined
  if (mode === 'users') return { user_ids: userIds }
  const a: Audience = {}
  if (filter.versions.length) a.versions = filter.versions
  if (filter.platforms.length) a.platforms = filter.platforms
  if (filter.statuses.length) a.statuses = filter.statuses
  return a
}

/** Newest version first ("3.10.0" after "3.9.1"); 'unknown' last. */
export function compareVersions(a: string, b: string): number {
  if (a === b) return 0
  if (a === 'unknown') return 1
  if (b === 'unknown') return -1
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0)
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pb[i] ?? 0) - (pa[i] ?? 0)
    if (d) return d
  }
  return b.localeCompare(a)
}

const labelOf = <T extends string>(list: { value: T; label: string }[], v: T) =>
  list.find((x) => x.value === v)?.label ?? v

/** Short description of who a push went to, for the history. */
export function audienceLabel(audience: Audience | null): string {
  if (!audience) return 'All users'
  if (audience.user_ids?.length) {
    const n = audience.user_ids.length
    return n === 1 ? '1 chosen user' : `${n} chosen users`
  }
  const parts = [
    audience.versions?.length ? `v${audience.versions.join(', v')}` : null,
    audience.platforms?.length
      ? audience.platforms.map((p) => labelOf(PLATFORMS, p)).join(', ')
      : null,
    audience.statuses?.length
      ? audience.statuses.map((s) => labelOf(STATUSES, s)).join(', ')
      : null,
  ].filter(Boolean)
  return parts.length ? `Signed-in · ${parts.join(' · ')}` : 'All signed-in users'
}
