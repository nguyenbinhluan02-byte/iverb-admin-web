import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  CalendarDays,
  CircleCheck,
  Eye,
  EyeOff,
  History,
  Layers,
  Pencil,
  RefreshCw,
  Search,
  Shield,
  Type,
  User,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Avatar } from '@/components/Avatar'
import { StatusBadge, TypeBadge, UserSubmittedBadge } from '@/components/Badge'
import { FilterDropdown, type FilterOption } from '@/components/FilterDropdown'
import { PageHeader } from '@/components/PageHeader'
import { TYPE_ICONS } from '@/components/typeIcons'
import { errorMessage } from '@/lib/errors'
import { authorName, displayText, isUserSubmitted, TYPE_LABELS } from '@/lib/question'
import { useQuestions, type Question, type QType } from '@/services/questions'
import {
  countFilters,
  DEFAULT_FILTERS,
  filterQuestions,
  type LibraryFilters,
  type SortOrder,
  type SourceFilter,
  type StatusFilter,
  type TypeFilter,
} from './filter'
import { HistoryDialog } from './HistoryDialog'
import { QuestionViewDialog } from './QuestionViewDialog'

const GREEN = { iconColor: 'var(--color-green-text)', iconBg: 'rgba(31,169,113,.12)' }
const ORANGE = { iconColor: 'var(--color-brand-deep)', iconBg: 'rgba(242,113,28,.12)' }
const TYPE_TINT = { iconColor: 'var(--color-brand-deep)', iconBg: 'rgba(242,113,28,.1)' }

const rowButton = 'flex items-center gap-1.5 rounded-[9px] px-3 py-2 text-[13px] whitespace-nowrap'

// Filters live in the URL so a filtered list can be shared / reloaded.
function useLibraryFilters(): [LibraryFilters, (patch: Partial<LibraryFilters>) => void] {
  const [params, setParams] = useSearchParams()
  const filters: LibraryFilters = {
    query: params.get('q') ?? DEFAULT_FILTERS.query,
    status: (params.get('status') as StatusFilter) ?? DEFAULT_FILTERS.status,
    source: (params.get('by') as SourceFilter) ?? DEFAULT_FILTERS.source,
    type: (params.get('type') as TypeFilter) ?? DEFAULT_FILTERS.type,
    sort: (params.get('sort') as SortOrder) ?? DEFAULT_FILTERS.sort,
  }
  const update = (patch: Partial<LibraryFilters>) => {
    const next = { ...filters, ...patch }
    const entries: [string, string, string][] = [
      ['q', next.query, DEFAULT_FILTERS.query],
      ['status', next.status, DEFAULT_FILTERS.status],
      ['by', next.source, DEFAULT_FILTERS.source],
      ['type', next.type, DEFAULT_FILTERS.type],
      ['sort', next.sort, DEFAULT_FILTERS.sort],
    ]
    setParams(Object.fromEntries(entries.filter(([, v, d]) => v !== d).map(([k, v]) => [k, v])), {
      replace: true,
    })
  }
  return [filters, update]
}

export function LibraryPage() {
  const navigate = useNavigate()
  const { data: questions, isPending, isError, error } = useQuestions()
  const [filters, setFilters] = useLibraryFilters()
  const [viewing, setViewing] = useState<Question | null>(null)
  const [history, setHistory] = useState<Question | null>(null)

  const all = useMemo(() => questions ?? [], [questions])
  const rows = useMemo(() => filterQuestions(all, filters), [all, filters])
  const counts = useMemo(() => countFilters(all, filters.source), [all, filters.source])

  const edit = (q: Question) => navigate(`/questions/${q.id}/edit`)

  const statusOptions: FilterOption<StatusFilter>[] = [
    { value: 'all', label: 'All', icon: Layers, count: counts.status.all },
    {
      value: 'published',
      label: 'Published',
      icon: CircleCheck,
      count: counts.status.published,
      ...GREEN,
    },
    {
      value: 'unpublished',
      label: 'Not published',
      icon: EyeOff,
      count: counts.status.unpublished,
    },
    {
      value: 'upcoming',
      label: 'Upcoming',
      icon: CalendarDays,
      count: counts.status.upcoming,
      ...ORANGE,
    },
    { value: 'draft', label: 'Drafts', icon: Pencil, count: counts.status.draft },
  ]
  const sourceOptions: FilterOption<SourceFilter>[] = [
    { value: 'all', label: 'Anyone', icon: Users, count: counts.sources.all },
    {
      value: 'admin',
      label: 'Admins',
      icon: Shield,
      count: counts.sources.admin,
      iconColor: 'var(--color-ink)',
    },
    {
      value: 'user',
      label: 'Users',
      icon: User,
      count: counts.sources.user,
      iconColor: 'var(--color-blue-text)',
      iconBg: 'rgba(91,108,240,.12)',
    },
  ]
  const typeOptions: FilterOption<TypeFilter>[] = [
    { value: 'all', label: 'All', icon: Type },
    ...(Object.keys(TYPE_LABELS) as QType[]).map((t) => ({
      value: t,
      label: TYPE_LABELS[t],
      icon: TYPE_ICONS[t],
      ...TYPE_TINT,
    })),
  ]
  const sortOptions: FilterOption<SortOrder>[] = [
    { value: 'newest', label: 'Newest date first', icon: ArrowDown },
    { value: 'oldest', label: 'Oldest date first', icon: ArrowUp },
  ]

  return (
    <div className="mx-auto flex max-w-[1040px] flex-col gap-5">
      <PageHeader kicker={`${all.length} questions`} title="Library" />

      <div className="flex items-center gap-2.5 rounded-xl border border-line bg-card px-3.5">
        <Search size={18} strokeWidth={2.2} className="shrink-0 text-muted" />
        <input
          value={filters.query}
          onChange={(e) => setFilters({ query: e.target.value })}
          placeholder={'Search by word, answer or author — e.g. "swim"'}
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
          label="Added by"
          icon={User}
          value={filters.source}
          options={sourceOptions}
          onChange={(source) => setFilters({ source })}
        />
        <FilterDropdown
          label="Type"
          icon={Type}
          value={filters.type}
          options={typeOptions}
          onChange={(type) => setFilters({ type })}
        />
        <FilterDropdown
          label="Sort"
          icon={ArrowDownUp}
          value={filters.sort}
          options={sortOptions}
          onChange={(sort) => setFilters({ sort })}
        />
      </div>

      <div className="overflow-hidden rounded-[18px] border border-line bg-card">
        {isPending && <Message>Loading questions…</Message>}
        {isError && <Message>{errorMessage(error)}</Message>}
        {questions && rows.length === 0 && <Message>No questions match your search.</Message>}
        {rows.map((q, i) => (
          <div
            key={q.id}
            className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[18px] px-5 py-3.5 ${
              i ? 'border-t border-line' : ''
            }`}
          >
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <TypeBadge type={q.type} />
                <StatusBadge status={q.status} />
                {isUserSubmitted(q) && <UserSubmittedBadge />}
              </div>
              <span className="truncate text-[15px] leading-[1.4] font-bold">{displayText(q)}</span>
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <Avatar name={authorName(q)} size={18} />
                <span>
                  By <b className="text-ink">{authorName(q)}</b>
                </span>
              </span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                title="View question"
                onClick={() => setViewing(q)}
                className={`${rowButton} border border-line-strong bg-card font-bold hover:bg-page`}
              >
                <Eye size={14} strokeWidth={2.4} />
                View
              </button>
              <button
                type="button"
                title="Usage history"
                onClick={() => setHistory(q)}
                className={`${rowButton} border border-line-strong bg-card font-bold hover:bg-page`}
              >
                <History size={14} strokeWidth={2.4} />
                History
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-page px-[5px] text-[11px] font-extrabold">
                  {q.usage_count}
                </span>
              </button>
              {q.status === 'published' ? (
                // Reuse calendar comes with the Schedule screen (TASK-004).
                <button
                  type="button"
                  disabled
                  title="Coming soon"
                  className={`${rowButton} bg-[rgba(242,113,28,.12)] px-3.5 font-extrabold text-brand-deep disabled:opacity-50`}
                >
                  <RefreshCw size={14} strokeWidth={2.4} />
                  Reuse
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => edit(q)}
                  className={`${rowButton} border border-line-strong bg-card px-3.5 font-bold hover:bg-page`}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <QuestionViewDialog
        question={viewing}
        onClose={() => setViewing(null)}
        onHistory={(q) => {
          setViewing(null)
          setHistory(q)
        }}
        onEdit={(q) => {
          setViewing(null)
          edit(q)
        }}
      />
      <HistoryDialog question={history} onClose={() => setHistory(null)} />
    </div>
  )
}

function Message({ children }: { children: string }) {
  return <div className="px-5 py-12 text-center text-sm text-muted">{children}</div>
}
