import { WEEK_STATUS } from '@/lib/weeks'
import type { WeekStatus } from '@/services/weeks'

export function WeekStatusBadge({ status }: { status: WeekStatus }) {
  const s = WEEK_STATUS[status]
  return (
    <span
      className="rounded-full px-2.5 py-1 text-xs font-extrabold whitespace-nowrap"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  )
}
