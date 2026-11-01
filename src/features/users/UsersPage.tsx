import {
  Apple,
  ArrowDown,
  ArrowDownAZ,
  ArrowDownUp,
  ArrowUp,
  CircleCheck,
  CircleSlash,
  Clock,
  Crown,
  Gift,
  Globe,
  History,
  KeyRound,
  Layers,
  Mail,
  Search,
  User as UserIcon,
  Users,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { Avatar } from '@/components/Avatar'
import { TONES } from '@/components/badgeStyles'
import { FilterDropdown, type FilterOption } from '@/components/FilterDropdown'
import { PageHeader } from '@/components/PageHeader'
import { Pagination } from '@/components/Pagination'
import { GREEN_TINT, ORANGE_TINT } from '@/features/library/filterOptions'
import { todayUTC } from '@/lib/dates'
import { errorMessage } from '@/lib/errors'
import { pageCount } from '@/lib/pagination'
import { useDebounced } from '@/lib/useDebounced'
import {
  USERS_PAGE_SIZE,
  useUserDetail,
  useUserPage,
  type AdminUser,
  type PlanFilter,
  type ProviderFilter,
  type StatusFilter,
  type UserCounts,
  type UserFilters,
  type UserSort,
  type UserStatus,
} from '@/services/users'
import { MonthPicker } from './MonthPicker'
import {
  DEFAULT_USER_FILTERS,
  PROVIDER_LABELS,
  STATUS_PILL,
  formatDay,
  lastActiveLabel,
  planDate,
  planName,
  planSubline,
  statusNote,
} from './usersModel'

const EMPTY_COUNTS: UserCounts = {
  status: { all: 0, active: 0, expired: 0, free: 0 },
  plan: { all: 0, premium: 0, gift: 0, none: 0 },
  provider: { all: 0, google: 0, apple: 0, email: 0 },
}

const COLUMNS = 'grid grid-cols-[minmax(200px,1fr)_140px_130px_100px_100px] gap-3.5 min-w-[740px]'

// Filters and the page live in the URL (like Library). Any change → page 1.
function useUserFilters() {
  const [params, setParams] = useSearchParams()
  const d = DEFAULT_USER_FILTERS
  const filters: UserFilters = {
    query: params.get('q') ?? d.query,
    status: (params.get('status') as StatusFilter) ?? d.status,
    plan: (params.get('plan') as PlanFilter) ?? d.plan,
    joined: params.get('joined') ?? d.joined,
    provider: (params.get('signin') as ProviderFilter) ?? d.provider,
    sort: (params.get('sort') as UserSort) ?? d.sort,
  }
  const page = Math.max(1, Number(params.get('page')) || 1)

  const write = (next: UserFilters, nextPage: number) => {
    const entries: [string, string, string][] = [
      ['q', next.query, d.query],
      ['status', next.status, d.status],
      ['plan', next.plan, d.plan],
      ['joined', next.joined, d.joined],
      ['signin', next.provider, d.provider],
      ['sort', next.sort, d.sort],
      ['page', String(nextPage), '1'],
    ]
    setParams(
      Object.fromEntries(entries.filter(([, v, def]) => v !== def).map(([k, v]) => [k, v])),
      {
        replace: true,
      },
    )
  }
  return {
    filters,
    page,
    setFilters: (patch: Partial<UserFilters>) => write({ ...filters, ...patch }, 1),
    setPage: (next: number) => write(filters, next),
  }
}

// Design: Users (read only). No create / edit / delete controls.
export function UsersPage() {
  const today = todayUTC()
  const { filters, setFilters, page, setPage } = useUserFilters()
  const query = useDebounced(filters.query)
  const result = useUserPage({ ...filters, query }, page)
  const rows = result.data?.items ?? []
  const total = result.data?.total ?? 0
  const counts = result.data?.counts ?? EMPTY_COUNTS
  const firstYear = Number((result.data?.first_joined_at ?? today).slice(0, 4))

  // First row of the page is selected by default.
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = rows.find((u) => u.id === selectedId) ?? rows[0] ?? null

  const pages = pageCount(total, USERS_PAGE_SIZE)
  useEffect(() => {
    if (result.isSuccess && !result.isPlaceholderData && page > pages) setPage(pages)
  })

  const statusOptions: FilterOption<StatusFilter>[] = [
    { value: 'all', label: 'All', icon: Layers, count: counts.status.all },
    {
      value: 'active',
      label: 'Active',
      icon: CircleCheck,
      count: counts.status.active,
      ...GREEN_TINT,
    },
    {
      value: 'expired',
      label: 'Expired',
      icon: History,
      count: counts.status.expired,
      ...ORANGE_TINT,
    },
    { value: 'free', label: 'Free', icon: UserIcon, count: counts.status.free },
  ]
  const planOptions: FilterOption<PlanFilter>[] = [
    { value: 'all', label: 'All', icon: Layers, count: counts.plan.all },
    { value: 'premium', label: 'Premium', icon: Crown, count: counts.plan.premium, ...ORANGE_TINT },
    { value: 'gift', label: 'Free gift', icon: Gift, count: counts.plan.gift },
    { value: 'none', label: 'No plan', icon: CircleSlash, count: counts.plan.none },
  ]
  const providerOptions: FilterOption<ProviderFilter>[] = [
    { value: 'all', label: 'Any', icon: Users, count: counts.provider.all },
    { value: 'google', label: 'Google', icon: Globe, count: counts.provider.google },
    { value: 'apple', label: 'Apple', icon: Apple, count: counts.provider.apple },
    { value: 'email', label: 'Email', icon: Mail, count: counts.provider.email },
  ]
  const sortOptions: FilterOption<UserSort>[] = [
    { value: 'recent', label: 'Recently active', icon: Clock },
    { value: 'newest', label: 'Newest joined', icon: ArrowDown },
    { value: 'oldest', label: 'Oldest joined', icon: ArrowUp },
    { value: 'name', label: 'Name A–Z', icon: ArrowDownAZ },
  ]

  return (
    <div className="mx-auto flex max-w-[1240px] flex-col gap-5">
      <PageHeader kicker={`${counts.status.all} accounts · read only`} title="Users" />

      <div className="flex items-center gap-2.5 rounded-xl border border-line bg-card px-3.5">
        <Search size={18} strokeWidth={2.2} className="shrink-0 text-muted" />
        <input
          value={filters.query}
          onChange={(e) => setFilters({ query: e.target.value })}
          placeholder="Search by name or email"
          className="min-w-0 flex-1 border-none bg-transparent py-[13px] text-[15px] focus:shadow-none!"
        />
      </div>

      <div className="-mt-2 flex flex-wrap gap-1.5">
        <FilterDropdown
          label="Status"
          icon={CircleCheck}
          value={filters.status}
          options={statusOptions}
          onChange={(status) => setFilters({ status })}
        />
        <FilterDropdown
          label="Plan"
          icon={Crown}
          value={filters.plan}
          options={planOptions}
          onChange={(plan) => setFilters({ plan })}
        />
        <MonthPicker
          value={filters.joined}
          onChange={(joined) => setFilters({ joined })}
          firstYear={firstYear}
          today={today}
        />
        <FilterDropdown
          label="Sign-in"
          icon={KeyRound}
          value={filters.provider}
          options={providerOptions}
          onChange={(provider) => setFilters({ provider })}
        />
        <FilterDropdown
          label="Sort"
          icon={ArrowDownUp}
          value={filters.sort}
          options={sortOptions}
          onChange={(sort) => setFilters({ sort })}
        />
      </div>

      <div className="flex flex-wrap items-start gap-[18px]">
        <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-3.5">
          <div className="overflow-x-auto rounded-[18px] border border-line bg-card">
            <div
              className={`${COLUMNS} border-b border-l-[3px] border-b-line border-l-transparent px-5 py-3 text-[11px] font-extrabold tracking-[.06em] text-muted uppercase`}
            >
              <span>User</span>
              <span>Status</span>
              <span>Plan</span>
              <span>Joined</span>
              <span>Last active</span>
            </div>
            {result.isPending && <Message>Loading users…</Message>}
            {result.isError && <Message>{errorMessage(result.error)}</Message>}
            {result.isSuccess && rows.length === 0 && (
              <Message>No users match your search.</Message>
            )}
            {rows.map((u) => {
              const on = u.id === selected?.id
              return (
                <button
                  key={u.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelectedId(u.id)}
                  className={`${COLUMNS} w-full items-center border-l-[3px] px-5 py-3 text-left ${
                    on
                      ? 'border-l-brand bg-brand-tint-2'
                      : 'border-l-transparent hover:bg-[#FAFAFA]'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={u.name ?? u.email} src={u.avatar_url} size={34} />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-bold">{u.name ?? '—'}</span>
                      <span className="truncate text-xs text-muted">{u.email}</span>
                    </span>
                  </span>
                  <span>
                    <StatusPill status={u.status} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[13px] font-bold">{planName(u)}</span>
                    <span className="truncate text-xs text-muted">{planSubline(u)}</span>
                  </span>
                  <span className="text-[13px]">{formatDay(u.joined_at)}</span>
                  <span className="text-[13px] text-muted">
                    {lastActiveLabel(u.last_active_at, today)}
                  </span>
                </button>
              )
            })}
          </div>
          <Pagination page={page} size={USERS_PAGE_SIZE} total={total} onChange={setPage} />
        </div>

        {selected && <DetailPanel user={selected} today={today} />}
      </div>
    </div>
  )
}

function StatusPill({ status, large }: { status: UserStatus; large?: boolean }) {
  const pill = STATUS_PILL[status]
  return (
    <span
      className={`inline-flex rounded-full px-[9px] py-[3px] font-extrabold whitespace-nowrap ${
        large ? 'text-xs' : 'text-[11px]'
      } ${TONES[pill.tone]}`}
    >
      {pill.label}
    </span>
  )
}

function DetailPanel({ user: u, today }: { user: AdminUser; today: string }) {
  const detail = useUserDetail(u.id)
  const stats = detail.data?.id === u.id ? detail.data.stats : undefined
  const date = planDate(u)
  const value = (n: number | null | undefined, suffix = '') => (n == null ? '—' : `${n}${suffix}`)

  const account: [string, string][] = [
    ['User ID', u.id],
    ['Sign-in', PROVIDER_LABELS[u.provider]],
    ['Plan', planName(u)],
    ...(date ? [[date.label, date.value] as [string, string]] : []),
    ['Joined', formatDay(u.joined_at)],
    ['Last active', lastActiveLabel(u.last_active_at, today)],
  ]
  const tiles: [string, string][] = [
    ['Questions answered', value(stats?.answered)],
    ['Accuracy', stats ? value(stats.accuracy_pct, '%') : '—'],
    ['Current streak', value(stats?.streak_days, stats?.streak_days === 1 ? ' day' : ' days')],
    ['Community answers', value(stats?.community_answers)],
    ['Questions submitted', value(stats?.submissions)],
    ['Times reported', value(stats?.reports_received)],
  ]

  return (
    <aside
      aria-label="User details"
      className="sticky top-[30px] min-w-[300px] flex-[0_1_360px] rounded-[18px] border border-line bg-card"
    >
      <div className="flex flex-col items-center gap-1.5 border-b border-line px-[22px] pt-[22px] pb-[18px] text-center">
        <Avatar name={u.name ?? u.email} src={u.avatar_url} size={56} />
        <span className="mt-1 text-[17px] font-extrabold">{u.name ?? '—'}</span>
        <span className="text-[13px] break-all text-muted">{u.email}</span>
        <StatusPill status={u.status} large />
        <span className="text-xs text-muted">{statusNote(u)}</span>
      </div>

      <Section title="Account">
        <dl className="flex flex-col gap-2 text-[13px]">
          {account.map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-3">
              <dt className="shrink-0 text-muted">{k}</dt>
              <dd className="min-w-0 text-right font-bold break-all">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Activity">
        {detail.isError ? (
          <span className="text-[13px] text-muted">{errorMessage(detail.error)}</span>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {tiles.map(([label, v]) => (
              <div key={label} className="flex flex-col rounded-xl bg-[#F7F7F8] px-3 py-2.5">
                <span className="text-lg font-extrabold">{v}</span>
                <span className="text-xs text-muted">{label}</span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </aside>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-b border-line px-[22px] py-[18px] last:border-b-0">
      <h2 className="text-[11px] font-extrabold tracking-[.06em] text-muted uppercase">{title}</h2>
      {children}
    </section>
  )
}

function Message({ children }: { children: string }) {
  return <div className="px-4 py-12 text-center text-sm text-muted">{children}</div>
}
