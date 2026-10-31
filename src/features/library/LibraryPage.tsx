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
  Type,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Avatar } from '@/components/Avatar'
import { StatusBadge, TypeBadge, UserSubmittedBadge } from '@/components/Badge'
import { FilterDropdown, type FilterOption } from '@/components/FilterDropdown'
import { PageHeader } from '@/components/PageHeader'
import { errorMessage } from '@/lib/errors'
import { authorName, displayText, isListening, isUserSubmitted } from '@/lib/question'
import { ReuseDialog } from '@/features/schedule/ReuseDialog'
import { useDebounced } from '@/lib/useDebounced'
import { pageCount } from '@/lib/pagination'
import {
  LIBRARY_PAGE_SIZE,
  useQuestionPage,
  type Question,
  type SearchCounts,
} from '@/services/questions'
import { Pagination } from '@/components/Pagination'
import {
  DEFAULT_FILTERS,
  type LibraryFilters,
  type SortOrder,
  type SourceFilter,
  type StatusFilter,
  type TypeFilter,
} from './filter'
import { GREEN_TINT, ORANGE_TINT, sourceOptions, typeOptions } from './filterOptions'
import { HistoryDialog } from './HistoryDialog'
import { QuestionViewDialog } from './QuestionViewDialog'

const EMPTY_COUNTS: SearchCounts = {
  status: { all: 0, published: 0, unpublished: 0, upcoming: 0, draft: 0 },
  sources: { all: 0, admin: 0, user: 0 },
}

const rowButton = 'flex items-center gap-1.5 rounded-[9px] px-3 py-2 text-[13px] whitespace-nowrap'

// Filters and the page live in the URL so a list can be shared / reloaded.
// Changing a filter goes back to page 1 (design).
function useLibraryFilters() {
  const [params, setParams] = useSearchParams()
  const filters: LibraryFilters = {
    query: params.get('q') ?? DEFAULT_FILTERS.query,
    status: (params.get('status') as StatusFilter) ?? DEFAULT_FILTERS.status,
    source: (params.get('by') as SourceFilter) ?? DEFAULT_FILTERS.source,
    type: (params.get('type') as TypeFilter) ?? DEFAULT_FILTERS.type,
    sort: (params.get('sort') as SortOrder) ?? DEFAULT_FILTERS.sort,
  }
  const page = Math.max(1, Number(params.get('page')) || 1)

  const write = (next: LibraryFilters, nextPage: number) => {
    const entries: [string, string, string][] = [
      ['q', next.query, DEFAULT_FILTERS.query],
      ['status', next.status, DEFAULT_FILTERS.status],
      ['by', next.source, DEFAULT_FILTERS.source],
      ['type', next.type, DEFAULT_FILTERS.type],
      ['sort', next.sort, DEFAULT_FILTERS.sort],
      ['page', String(nextPage), '1'],
    ]
    setParams(Object.fromEntries(entries.filter(([, v, d]) => v !== d).map(([k, v]) => [k, v])), {
      replace: true,
    })
  }
  const setFilters = (patch: Partial<LibraryFilters>) => write({ ...filters, ...patch }, 1)
  const setPage = (next: number) => write(filters, next)
  return { filters, setFilters, page, setPage }
}

export function LibraryPage() {
  const navigate = useNavigate()
  const { filters, setFilters, page, setPage } = useLibraryFilters()
  const [viewing, setViewing] = useState<Question | null>(null)
  const [history, setHistory] = useState<Question | null>(null)
  const [reusing, setReusing] = useState<Question | null>(null)

  // Typing in the search box should not fire a request per key press.
  const query = useDebounced(filters.query)
  const result = useQuestionPage({ ...filters, query }, page)
  const rows = result.data?.items ?? []
  const total = result.data?.total ?? 0
  const counts = result.data?.counts ?? EMPTY_COUNTS

  // Results shrank (e.g. after a delete elsewhere): clamp to the last page.
  const pages = pageCount(total, LIBRARY_PAGE_SIZE)
  useEffect(() => {
    if (result.isSuccess && !result.isPlaceholderData && page > pages) setPage(pages)
  })

  const edit = (q: Question) => navigate(`/questions/${q.id}/edit`, { state: { from: '/library' } })

  const statusOptions: FilterOption<StatusFilter>[] = [
    { value: 'all', label: 'All', icon: Layers, count: counts.status.all },
    {
      value: 'published',
      label: 'Published',
      icon: CircleCheck,
      count: counts.status.published,
      ...GREEN_TINT,
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
      ...ORANGE_TINT,
    },
    { value: 'draft', label: 'Drafts', icon: Pencil, count: counts.status.draft },
  ]
  const sortOptions: FilterOption<SortOrder>[] = [
    { value: 'newest', label: 'Newest date first', icon: ArrowDown },
    { value: 'oldest', label: 'Oldest date first', icon: ArrowUp },
  ]

  return (
    <div className="mx-auto flex max-w-[1040px] flex-col gap-5">
      <PageHeader kicker={`${counts.sources.all} questions`} title="Library" />

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
          options={sourceOptions(counts.sources)}
          onChange={(source) => setFilters({ source })}
        />
        <FilterDropdown
          label="Type"
          icon={Type}
          value={filters.type}
          options={typeOptions()}
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
        {result.isPending && <Message>Loading questions…</Message>}
        {result.isError && <Message>{errorMessage(result.error)}</Message>}
        {result.isSuccess && rows.length === 0 && (
          <Message>No questions match your search.</Message>
        )}
        {rows.map((q, i) => (
          <div
            key={q.id}
            className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[18px] px-5 py-3.5 ${
              i ? 'border-t border-line' : ''
            }`}
          >
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <TypeBadge type={q.type} listening={isListening(q)} />
                <StatusBadge status={q.status} />
                {isUserSubmitted(q) && <UserSubmittedBadge />}
              </div>
              <span className="truncate text-[15px] leading-[1.4] font-bold">{displayText(q)}</span>
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <Avatar name={authorName(q)} src={q.author?.avatar_url} size={18} />
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
                <button
                  type="button"
                  onClick={() => setReusing(q)}
                  className={`${rowButton} bg-[rgba(242,113,28,.12)] px-3.5 font-extrabold text-brand-deep hover:bg-[rgba(242,113,28,.2)]`}
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

      <Pagination page={page} size={LIBRARY_PAGE_SIZE} total={total} onChange={setPage} />

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
        onReuse={(q) => {
          setViewing(null)
          setReusing(q)
        }}
      />
      <HistoryDialog question={history} onClose={() => setHistory(null)} />
      <ReuseDialog question={reusing} onClose={() => setReusing(null)} />
    </div>
  )
}

function Message({ children }: { children: string }) {
  return <div className="px-5 py-12 text-center text-sm text-muted">{children}</div>
}
