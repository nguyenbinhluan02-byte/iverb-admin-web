import { Check, Plus, Search, X } from 'lucide-react'
import { useDeferredValue, useState, type ReactNode } from 'react'
import { Segmented } from '@/components/Segmented'
import type { AudienceReach } from '@/services/pushes'
import { useUserPage, type AdminUser } from '@/services/users'
import {
  compareVersions,
  PLATFORMS,
  STATUSES,
  type AudienceFilter,
  type AudienceMode,
} from './notificationsModel'

// "Send to" on the Notifications page (TASK-033). No design: built from the
// existing Segmented control, cards and form fields.

const MODES: { value: AudienceMode; label: string }[] = [
  { value: 'all', label: 'All users' },
  { value: 'filter', label: 'Filter' },
  { value: 'users', label: 'Specific users' },
]

export function AudiencePicker({
  mode,
  onMode,
  filter,
  onFilter,
  users,
  onUsers,
  reach,
  reachLoading,
  disabled,
}: {
  mode: AudienceMode
  onMode: (m: AudienceMode) => void
  filter: AudienceFilter
  onFilter: (f: AudienceFilter) => void
  users: AdminUser[]
  onUsers: (u: AdminUser[]) => void
  reach: AudienceReach | undefined
  reachLoading: boolean
  disabled?: boolean
}) {
  const toggle = <K extends keyof AudienceFilter>(key: K, value: AudienceFilter[K][number]) => {
    const list = filter[key] as string[]
    onFilter({
      ...filter,
      [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    })
  }
  const versions = [...(reach?.versions ?? [])].sort((a, b) =>
    compareVersions(a.version, b.version),
  )

  return (
    <fieldset disabled={disabled} className="flex flex-col gap-3">
      <span className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[13px] font-extrabold">Send to</span>
        <Segmented value={mode} options={MODES} onChange={onMode} />
      </span>

      {mode === 'all' && (
        <Hint>
          Every device with the app (guests too) that has not turned off News &amp; announcements.
        </Hint>
      )}

      {mode === 'filter' && (
        <div className="flex flex-col gap-3 rounded-xl bg-page px-3.5 py-3">
          <Row label="App version">
            {versions.length === 0 && <span className="text-xs text-muted">No devices yet.</span>}
            {versions.map((v) => (
              <Chip
                key={v.version}
                on={filter.versions.includes(v.version)}
                onClick={() => toggle('versions', v.version)}
              >
                {v.version === 'unknown' ? 'Unknown' : v.version}
                <span className="font-semibold text-muted">{v.devices}</span>
              </Chip>
            ))}
          </Row>
          <Row label="Platform">
            {PLATFORMS.map((p) => (
              <Chip
                key={p.value}
                on={filter.platforms.includes(p.value)}
                onClick={() => toggle('platforms', p.value)}
              >
                {p.label}
              </Chip>
            ))}
          </Row>
          <Row label="Plan">
            {STATUSES.map((s) => (
              <Chip
                key={s.value}
                on={filter.statuses.includes(s.value)}
                onClick={() => toggle('statuses', s.value)}
              >
                {s.label}
              </Chip>
            ))}
          </Row>
          <Hint>Nothing selected in a row = any.</Hint>
        </div>
      )}

      {mode === 'users' && <UserPicker users={users} onUsers={onUsers} />}

      {mode !== 'all' && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold" aria-live="polite">
            {reach && !(reachLoading && !reach)
              ? `Reaches ${reach.users} ${reach.users === 1 ? 'user' : 'users'} · ${reach.devices} ${
                  reach.devices === 1 ? 'device' : 'devices'
                }`
              : 'Counting…'}
          </span>
          <Hint>
            Signed-in users only (guests have no saved device). Sent even if they turned off News
            &amp; announcements.
          </Hint>
        </div>
      )}
    </fieldset>
  )
}

function UserPicker({ users, onUsers }: { users: AdminUser[]; onUsers: (u: AdminUser[]) => void }) {
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query.trim())
  const { data, isPending } = useUserPage(
    { query: deferred, status: 'all', plan: 'all', joined: '', provider: 'all', sort: 'recent' },
    1,
  )
  const chosen = new Set(users.map((u) => u.id))

  return (
    <div className="flex flex-col gap-2.5 rounded-xl bg-page px-3.5 py-3">
      {users.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Chosen users">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex items-center gap-1 rounded-full bg-brand-tint py-1 pr-1 pl-2.5 text-xs font-bold text-ink"
            >
              {u.name || u.email || 'User'}
              <button
                type="button"
                aria-label={`Remove ${u.name || u.email || 'user'}`}
                onClick={() => onUsers(users.filter((x) => x.id !== u.id))}
                className="flex size-5 items-center justify-center rounded-full hover:bg-black/10"
              >
                <X size={12} strokeWidth={2.6} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <label className="flex items-center gap-2 rounded-[10px] border border-line-strong bg-card px-3 py-2">
        <Search size={15} className="shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or email"
          aria-label="Search users"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </label>
      <ul className="flex max-h-56 flex-col overflow-y-auto">
        {isPending && <li className="py-2 text-xs text-muted">Searching…</li>}
        {data?.items.length === 0 && <li className="py-2 text-xs text-muted">No users found.</li>}
        {data?.items.map((u) => {
          const on = chosen.has(u.id)
          return (
            <li key={u.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onUsers(on ? users.filter((x) => x.id !== u.id) : [...users, u])}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-hover"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-bold">{u.name || 'No name'}</span>
                  <span className="truncate text-xs text-muted">{u.email}</span>
                </span>
                {on ? (
                  <Check size={16} className="shrink-0 text-brand" />
                ) : (
                  <Plus size={16} className="shrink-0 text-muted" />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-extrabold text-muted">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-bold ${
        on ? 'border-brand bg-brand-tint text-ink' : 'border-line-strong bg-card text-muted'
      }`}
    >
      {children}
    </button>
  )
}

function Hint({ children }: { children: ReactNode }) {
  return <span className="text-xs leading-normal text-muted">{children}</span>
}
