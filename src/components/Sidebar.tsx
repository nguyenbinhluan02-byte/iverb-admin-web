import {
  Bell,
  BookOpen,
  BookOpenText,
  CalendarDays,
  CirclePlus,
  Inbox,
  LogOut,
  Sun,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Fragment } from 'react'
import { NavLink } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { useToday } from '@/services/today'
import { useWeeksNeedingWork } from '@/services/weeks'
import { Avatar } from './Avatar'

// Design v3 §1: This week + Weeks after Today, then a divider.
const NAV: { to: string; label: string; icon: LucideIcon; divider?: boolean }[] = [
  { to: '/today', label: 'Today', icon: Sun },
  { to: '/week', label: 'This week', icon: BookOpenText },
  { to: '/weeks', label: 'Weeks', icon: CalendarDays, divider: true },
  { to: '/library', label: 'Library', icon: BookOpen },
  { to: '/questions/new', label: 'New question', icon: CirclePlus },
  { to: '/submissions', label: 'Submissions', icon: Inbox },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/users', label: 'Users', icon: Users },
]

// Filled orange badges (needs attention); the rest are grey.
const ORANGE_BADGES = new Set(['/today', '/weeks'])

export function Sidebar() {
  const { me, signOut } = useAuth()
  const { data: today } = useToday()
  const { data: needing } = useWeeksNeedingWork()
  // Design: Today = reported explanations, Weeks = upcoming weeks not ready (empty / draft).
  const badges: Record<string, number> = {
    '/today': today?.reported_count ?? 0,
    '/weeks': needing?.count ?? 0,
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[228px] flex-[0_0_228px] flex-col border-r border-line bg-card px-3.5 py-[22px]">
      <div className="flex items-center gap-2.5 px-2">
        <span className="flex size-8 items-center justify-center rounded-[9px] bg-brand text-[15px] font-extrabold text-white">
          Q
        </span>
        <span className="flex flex-col leading-[1.2]">
          <span className="text-[15px] font-extrabold">IVerbs Admin</span>
          <span className="text-xs text-muted">Weekly lessons</span>
        </span>
      </div>

      <nav className="mt-[30px] flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon, divider }) => (
          <Fragment key={to}>
          <NavLink
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-bold ${
                isActive ? 'bg-brand-tint text-brand-deep' : 'text-ink hover:bg-hover'
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            <span className="flex-1">{label}</span>
            {!!badges[to] && (
              <span
                className={`flex h-5 min-w-[22px] items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold ${
                  ORANGE_BADGES.has(to)
                    ? 'bg-brand text-white'
                    : 'border border-line-strong bg-page text-ink'
                }`}
              >
                {badges[to]}
              </span>
            )}
          </NavLink>
          {divider && <span className="mx-1 my-2 h-px bg-line" />}
          </Fragment>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 border-t border-line px-2 py-2.5">
        <Avatar name={me?.name} src={me?.avatar_url} size={32} />
        <span className="flex min-w-0 flex-1 flex-col leading-[1.25]">
          <span className="truncate text-[13px] font-bold">{me?.name ?? me?.email}</span>
          <span className="text-xs text-muted">Content admin</span>
        </span>
        <button
          type="button"
          onClick={signOut}
          title="Sign out"
          aria-label="Sign out"
          className="rounded-lg p-1.5 text-muted hover:bg-hover hover:text-ink"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
