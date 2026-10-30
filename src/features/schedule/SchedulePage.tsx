import { format, parseISO } from 'date-fns'
import { BookOpen, ChevronLeft, ChevronRight, Eye, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Avatar } from '@/components/Avatar'
import { StatusBadge, TypeBadge, UserSubmittedBadge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { PageHeader } from '@/components/PageHeader'
import { Segmented } from '@/components/Segmented'
import { HistoryDialog } from '@/features/library/HistoryDialog'
import { QuestionViewDialog } from '@/features/library/QuestionViewDialog'
import { nextDays, todayUTC } from '@/lib/dates'
import { errorMessage } from '@/lib/errors'
import { authorName, displayText, isUserSubmitted } from '@/lib/question'
import { useQuestions, type Question } from '@/services/questions'
import { PickFromLibraryDialog } from './PickFromLibraryDialog'
import { ReuseDialog } from './ReuseDialog'
import {
  buildDays,
  countDays,
  coverageColor,
  monthDates,
  monthLabel,
  questionsByDate,
  SCHEDULE_DAYS,
  type ScheduleDay,
} from './scheduleModel'

type Mode = 'next' | 'month'

const rowButton =
  'flex items-center gap-1.5 rounded-[9px] px-3.5 py-2 text-[13px] whitespace-nowrap'

export function SchedulePage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const mode: Mode = params.get('view') === 'month' ? 'month' : 'next'
  const offset = Number(params.get('m') ?? 0) || 0
  const setView = (next: Mode, m = 0) =>
    setParams(next === 'month' ? { view: 'month', ...(m ? { m: String(m) } : {}) } : {}, {
      replace: true,
    })

  const { data: questions, isPending, isError, error } = useQuestions()
  const [viewing, setViewing] = useState<Question | null>(null)
  const [history, setHistory] = useState<Question | null>(null)
  const [reusing, setReusing] = useState<Question | null>(null)
  const [picking, setPicking] = useState<string | null>(null)

  const today = todayUTC()
  const byDate = useMemo(() => questionsByDate(questions ?? []), [questions])
  const dates = mode === 'month' ? monthDates(today, offset) : nextDays(today, SCHEDULE_DAYS)
  const days = buildDays(dates, today, byDate)
  const counts = countDays(days)

  const fromHere = { state: { from: `/schedule${params.size ? `?${params}` : ''}` } }
  const edit = (q: Question) => navigate(`/questions/${q.id}/edit`, fromHere)
  const add = (date?: string) => navigate(`/questions/new${date ? `?date=${date}` : ''}`, fromHere)

  return (
    <div className="mx-auto flex max-w-[1040px] flex-col gap-5">
      <PageHeader
        kicker={
          mode === 'month' ? `${monthLabel(today, offset)} · ${dates.length} days` : 'Next 14 days'
        }
        title="Schedule"
        actions={
          <Button onClick={() => add()}>
            <Plus size={16} strokeWidth={2.6} />
            New question
          </Button>
        }
      />

      <div className="-mt-1 flex flex-wrap items-center gap-2.5">
        <Segmented
          value={mode}
          options={[
            { value: 'next', label: 'Next 14 days' },
            { value: 'month', label: 'Month' },
          ]}
          onChange={(m) => setView(m)}
        />
        {mode === 'month' && (
          <div className="flex items-center gap-1 rounded-[10px] border border-line-strong bg-card p-1">
            <button
              type="button"
              title="Previous month"
              onClick={() => setView('month', offset - 1)}
              className="flex size-[30px] items-center justify-center rounded-[7px] hover:bg-page"
            >
              <ChevronLeft size={16} strokeWidth={2.4} />
            </button>
            <span className="min-w-[110px] text-center text-sm font-extrabold">
              {format(parseISO(dates[0]), 'MMMM yyyy')}
            </span>
            <button
              type="button"
              title="Next month"
              onClick={() => setView('month', offset + 1)}
              className="flex size-[30px] items-center justify-center rounded-[7px] hover:bg-page"
            >
              <ChevronRight size={16} strokeWidth={2.4} />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-card px-5 py-[18px]">
        <div className="flex flex-wrap gap-[18px] text-[13px] text-muted">
          <LegendItem color="var(--color-brand)" count={counts.scheduled} label="scheduled" />
          <LegendItem color="var(--color-brand-light)" count={counts.draft} label="draft" />
          <LegendItem color="var(--color-line-strong)" count={counts.empty} label="empty" />
        </div>
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
        >
          {days.map((d) => (
            <div
              key={d.date}
              title={format(parseISO(d.date), 'EEE, MMM d')}
              className="h-2.5 rounded-[3px]"
              style={{ background: coverageColor(d) }}
            />
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-line bg-card">
        {isPending && <Message>Loading schedule…</Message>}
        {isError && <Message>{errorMessage(error)}</Message>}
        {questions &&
          days.map((d, i) => (
            <DayRow
              key={d.date}
              day={d}
              first={i === 0}
              onView={setViewing}
              onEdit={edit}
              onAdd={() => add(d.date)}
              onPick={() => setPicking(d.date)}
            />
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
        onReuse={(q) => {
          setViewing(null)
          setReusing(q)
        }}
      />
      <HistoryDialog question={history} onClose={() => setHistory(null)} />
      <ReuseDialog question={reusing} onClose={() => setReusing(null)} />
      <PickFromLibraryDialog date={picking} onClose={() => setPicking(null)} />
    </div>
  )
}

function DayRow({
  day: d,
  first,
  onView,
  onEdit,
  onAdd,
  onPick,
}: {
  day: ScheduleDay
  first: boolean
  onView: (q: Question) => void
  onEdit: (q: Question) => void
  onAdd: () => void
  onPick: () => void
}) {
  const q = d.question
  const date = parseISO(d.date)
  const past = d.kind === 'past'

  return (
    <div
      data-testid={`day-${d.date}`}
      className={`grid grid-cols-[60px_minmax(0,1fr)_auto] items-center gap-[18px] px-5 py-3.5 ${
        first ? '' : 'border-t border-line'
      } ${d.kind === 'live' ? 'bg-brand-tint-2' : 'bg-card'} ${past ? 'opacity-60' : ''}`}
    >
      <div className="flex flex-col items-center leading-[1.1]">
        <span className="text-[11px] font-extrabold tracking-[.05em] text-muted uppercase">
          {format(date, 'EEE')}
        </span>
        <span className="text-[22px] font-extrabold">{format(date, 'd')}</span>
        <span className="text-[11px] text-muted">{format(date, 'MMM')}</span>
      </div>

      {q ? (
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={q.type} withIcon />
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
      ) : (
        <div className="rounded-xl border-[1.5px] border-dashed border-line-strong px-4 py-3.5 text-sm font-semibold text-muted">
          {past
            ? 'No question was shown this day.'
            : 'No question scheduled — users will see an empty day.'}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        {q && (
          <button
            type="button"
            title="View question"
            onClick={() => onView(q)}
            className={`${rowButton} border border-line-strong bg-card px-3 font-bold hover:bg-page`}
          >
            <Eye size={14} strokeWidth={2.4} />
            View
          </button>
        )}
        {q && !past && (
          <button
            type="button"
            onClick={() => onEdit(q)}
            className={`${rowButton} border border-line-strong bg-card font-bold hover:bg-page`}
          >
            Edit
          </button>
        )}
        {!q && !past && (
          <>
            <button
              type="button"
              onClick={onAdd}
              className={`${rowButton} bg-[rgba(242,113,28,.12)] font-extrabold text-brand-deep hover:bg-[rgba(242,113,28,.2)]`}
            >
              <Plus size={14} strokeWidth={2.6} />
              Add question
            </button>
            <button
              type="button"
              onClick={onPick}
              className={`${rowButton} border border-line-strong bg-card font-extrabold hover:bg-page`}
            >
              <BookOpen size={14} strokeWidth={2.4} />
              From library
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function LegendItem({ color, count, label }: { color: string; count: number; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-[3px]" style={{ background: color }} />
      <b className="text-ink">{count}</b> {label}
    </span>
  )
}

function Message({ children }: { children: string }) {
  return <div className="px-5 py-12 text-center text-sm text-muted">{children}</div>
}
