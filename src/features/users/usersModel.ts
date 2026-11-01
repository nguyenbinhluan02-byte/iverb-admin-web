import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import type { Tone } from '@/components/badgeStyles'
import type { AdminUser, Provider, UserFilters, UserPlan, UserStatus } from '@/services/users'

export const DEFAULT_USER_FILTERS: UserFilters = {
  query: '',
  status: 'all',
  plan: 'all',
  joined: '',
  provider: 'all',
  sort: 'recent',
}

export const STATUS_PILL: Record<UserStatus, { label: string; tone: Tone }> = {
  active: { label: 'Active', tone: 'green' },
  expired: { label: 'Expired', tone: 'pending' },
  free: { label: 'Free', tone: 'grey' },
}

export const PLAN_LABELS: Record<UserPlan, string> = {
  yearly: 'Premium yearly',
  lifetime: 'Premium lifetime',
  gift: 'Free gift',
  manual: 'Premium (manual)',
}

export const PROVIDER_LABELS: Record<Provider, string> = {
  google: 'Google',
  apple: 'Apple',
  email: 'Email',
}

export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** UTC calendar day of an ISO timestamp, e.g. "Oct 3, 2026". */
export function formatDay(iso: string): string {
  return format(parseISO(iso.slice(0, 10)), 'MMM d, yyyy')
}

/** "Today" / "Yesterday" / "N days ago" in UTC days; "—" when never seen. */
export function lastActiveLabel(iso: string | null, today: string): string {
  if (!iso) return '—'
  const days = differenceInCalendarDays(parseISO(today), parseISO(iso.slice(0, 10)))
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

export function planName(u: Pick<AdminUser, 'plan'>): string {
  return u.plan ? PLAN_LABELS[u.plan] : 'No plan'
}

/** Date row of a plan: label + value, or null when there is nothing to show. */
export function planDate(
  u: Pick<AdminUser, 'status' | 'plan' | 'plan_expires_at'>,
): { label: string; value: string } | null {
  if (!u.plan) return null
  if (!u.plan_expires_at) return u.status === 'active' ? { label: 'Ends', value: 'Never' } : null
  const day = formatDay(u.plan_expires_at)
  if (u.status === 'expired') return { label: 'Ended', value: day }
  return { label: u.plan === 'yearly' ? 'Renews' : 'Ends', value: day }
}

/** Sub-line under the plan name in the table. */
export function planSubline(u: Pick<AdminUser, 'status' | 'plan' | 'plan_expires_at'>): string {
  if (!u.plan) return 'Never premium'
  const d = planDate(u)
  return d ? `${d.label} ${d.value}` : ''
}

export function statusNote(u: Pick<AdminUser, 'status' | 'plan_expires_at'>): string {
  if (u.status === 'active') return 'Can answer daily questions and post in community.'
  if (u.status === 'expired') {
    const when = u.plan_expires_at ? ` ${formatDay(u.plan_expires_at)}` : ''
    return `Plan ended${when}. Can read but not answer until renewed.`
  }
  return 'Has never had premium. Can read but not answer.'
}

/** "Oct 2026" for 'YYYY-MM'; "Any month" when empty. */
export function monthLabel(month: string): string {
  if (!month) return 'Any month'
  const [y, m] = month.split('-')
  return `${MONTHS[Number(m) - 1]} ${y}`
}
