import { format, parseISO } from 'date-fns'
import { ArrowBigUp, MessageCircle, Trash2 } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Avatar } from '@/components/Avatar'
import { TypeBadge } from '@/components/Badge'
import { LoadMore } from '@/components/LoadMore'
import { Modal, ModalTitle } from '@/components/Modal'
import { QuestionBody } from '@/features/library/QuestionBody'
import { emptyDays } from '@/features/schedule/scheduleModel'
import { todayUTC } from '@/lib/dates'
import { errorMessage } from '@/lib/errors'
import { authorName, dayLabel, displayText } from '@/lib/question'
import { useQuestions, type Question } from '@/services/questions'
import {
  useDeleteReply,
  useExplanations,
  useRemoveExplanation,
  useReplies,
  useToday,
  type Explanation,
  type Reply,
  type TodayStats,
} from '@/services/today'
import { closesIn, correctRate, optionBars, pickLabel, timeAgo } from './todayModel'

const number = (n: number) => n.toLocaleString('en-US')

// Design: Today. Simplified (2026-10-29): no 7-day comparison, no reports.
// Replies (TASK-014): read + delete only, admins do not reply.
export function TodayPage() {
  const navigate = useNavigate()
  const { data: today, isPending, isError, error } = useToday()
  const { data: questions } = useQuestions()
  const date = todayUTC()
  const q = today?.question ?? null
  const rate = today ? correctRate(today.stats) : null
  const gaps = questions ? emptyDays(questions, date) : []

  return (
    <div className="mx-auto flex max-w-[1240px] flex-col gap-[22px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold tracking-[.06em] text-brand uppercase">
            <span className="size-2 rounded-full bg-brand" />
            Live now
          </div>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-[-0.01em]">
            Today · {format(parseISO(date), 'EEE, MMM d')}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ClosesIn />
          {q && (
            <button
              type="button"
              onClick={() => navigate(`/questions/${q.id}/edit`, { state: { from: '/today' } })}
              className="rounded-[10px] border border-line-strong bg-card px-4 py-2.5 text-sm font-bold whitespace-nowrap hover:bg-page"
            >
              Edit question
            </button>
          )}
        </div>
      </header>

      {isError && <Card>{errorMessage(error)}</Card>}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,130px),1fr))] gap-3.5">
        <Stat label="Answers" value={today ? number(today.stats.answers_count) : '–'} />
        <Stat
          label="Correct rate"
          value={rate == null ? '–' : `${rate}%`}
          note={
            today && rate != null
              ? `${number(today.stats.correct_count)} picked the right answer`
              : undefined
          }
        />
        <Stat label="User explanations" value={today ? number(today.explanations_count) : '–'} />
        <div className="flex flex-col gap-1.5 rounded-2xl border border-brand-tint-border bg-brand-tint px-5 py-[18px]">
          <span className="text-[13px] font-bold text-brand-deeper">Next empty day</span>
          <span className="text-2xl leading-[1.25] font-extrabold tracking-[-0.01em]">
            {gaps[0] ? dayLabel(gaps[0]) : 'All set'}
          </span>
          <button
            type="button"
            onClick={() =>
              gaps[0]
                ? navigate(`/questions/new?date=${gaps[0]}`, { state: { from: '/today' } })
                : navigate('/schedule')
            }
            className="self-start text-xs font-extrabold text-brand-deeper"
          >
            {gaps[0] ? `Add question · ${gaps.length} empty in 14 days →` : 'View schedule →'}
          </button>
        </div>
      </div>

      {isPending && <Card>Loading…</Card>}
      {today && !q && (
        <Card>
          No question is live today — users see an empty day.{' '}
          <button
            type="button"
            onClick={() => navigate('/schedule')}
            className="font-bold text-brand"
          >
            Open schedule
          </button>
        </Card>
      )}
      {today && q && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] items-start gap-[18px]">
          <QuestionCard question={q} stats={today.stats} />
          <Explanations question={q} count={today.explanations_count} />
        </div>
      )}
    </div>
  )
}

function ClosesIn() {
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="text-[13px] whitespace-nowrap text-muted">
      Closes in <b className="text-ink">{closesIn()}</b>
    </span>
  )
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-line bg-card px-5 py-[18px]">
      <span className="text-[13px] font-semibold text-muted">{label}</span>
      <span className="text-[30px] font-extrabold tracking-[-0.02em]">{value}</span>
      {note && <span className="text-xs text-muted">{note}</span>}
    </div>
  )
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-card px-5 py-10 text-center text-sm font-semibold text-muted">
      {children}
    </div>
  )
}

function QuestionCard({ question: q, stats }: { question: Question; stats: TodayStats }) {
  const choice = q.type === 'single' || q.type === 'multi'
  return (
    <div className="flex flex-col gap-[18px] rounded-[18px] border border-line bg-card px-6 py-[22px]">
      <div className="flex items-center justify-between gap-2.5">
        <TypeBadge type={q.type} withIcon />
        <span className="flex items-center gap-1.5 text-xs text-muted">
          By <Avatar name={authorName(q)} src={q.author?.avatar_url} size={22} />
          <b className="text-ink">{authorName(q)}</b>
        </span>
      </div>
      <h2 className="text-lg leading-[1.45] font-bold text-pretty">{displayText(q)}</h2>

      {choice ? (
        <div className="flex flex-col gap-3.5">
          {optionBars(q, stats).map((o) => (
            <div key={o.id} className="flex flex-col gap-[7px]">
              <div className="flex items-center gap-2.5 text-sm">
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-[7px] text-xs font-extrabold ${
                    o.correct ? 'bg-green text-white' : 'bg-page text-muted'
                  }`}
                >
                  {o.letter}
                </span>
                <span className="flex-1 font-bold">{o.text}</span>
                {o.correct && <span className="text-xs font-extrabold text-green">Correct</span>}
                <span className="min-w-11 text-right font-bold">{number(o.count)}</span>
                <span className="min-w-[38px] text-right text-muted">{o.pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded bg-page">
                <div
                  className="h-full rounded"
                  style={{
                    width: `${Math.min(o.pct, 100)}%`,
                    background: o.correct ? 'var(--color-green)' : 'var(--color-disabled)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <QuestionBody question={q} />
      )}

      {q.explanation && (
        <div className="flex flex-col gap-1.5 rounded-xl bg-page px-4 py-3.5">
          <span className="text-xs font-extrabold tracking-[.05em] text-muted uppercase">
            Official explanation
          </span>
          <span className="text-sm leading-normal text-pretty">{q.explanation}</span>
        </div>
      )}
    </div>
  )
}

type Confirm =
  { kind: 'explanation'; item: Explanation } | { kind: 'reply'; item: Reply; answerId: number }

function Explanations({ question, count }: { question: Question; count: number }) {
  const explanations = useExplanations(question.id)
  const { isPending, isError, error } = explanations
  const items = explanations.data?.pages.flatMap((p) => p.items)
  const remove = useRemoveExplanation()
  const deleteReply = useDeleteReply()
  const [confirming, setConfirming] = useState<Confirm | null>(null)

  const confirmDelete = async () => {
    if (!confirming) return
    try {
      if (confirming.kind === 'explanation') {
        await remove.mutateAsync(confirming.item.id)
        toast.success('Explanation deleted')
      } else {
        await deleteReply.mutateAsync({
          replyId: confirming.item.id,
          answerId: confirming.answerId,
        })
        toast.success('Reply deleted')
      }
      setConfirming(null)
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-[18px] border border-line bg-card px-6 pt-[22px] pb-2">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-extrabold">User explanations</h3>
        <span className="text-[13px] font-bold text-muted">{number(count)}</span>
      </div>
      <div className="-mx-6 max-h-[min(640px,calc(100vh-220px))] overflow-y-auto overscroll-contain px-6">
        {isPending && <Empty>Loading…</Empty>}
        {isError && <Empty>{errorMessage(error)}</Empty>}
        {items?.length === 0 && <Empty>No explanations yet.</Empty>}
        {items?.map((e) => (
          <ExplanationItem
            key={e.id}
            item={e}
            question={question}
            onDelete={() => setConfirming({ kind: 'explanation', item: e })}
            onDeleteReply={(r) => setConfirming({ kind: 'reply', item: r, answerId: e.id })}
          />
        ))}
        {explanations.hasNextPage && (
          <LoadMore
            shown={items?.length ?? 0}
            total={count}
            loading={explanations.isFetchingNextPage}
            onClick={() => explanations.fetchNextPage()}
          />
        )}
      </div>

      <Modal open={!!confirming} onClose={() => setConfirming(null)} maxWidth={420}>
        {confirming && (
          <div className="flex flex-col gap-4 p-6">
            <ModalTitle className="text-lg font-extrabold">
              {confirming.kind === 'explanation'
                ? 'Delete this explanation?'
                : 'Delete this reply?'}
            </ModalTitle>
            <div className="flex flex-col gap-1 rounded-xl bg-hover px-3.5 py-3">
              <b className="text-[13px]">{confirming.item.user.name ?? 'User'}</b>
              <span className="line-clamp-3 text-sm leading-normal">
                {confirming.kind === 'explanation'
                  ? confirming.item.explanation
                  : confirming.item.text}
              </span>
            </div>
            <span className="text-[13px] leading-normal text-muted">
              {confirming.kind === 'explanation'
                ? "It disappears from the app. The user's answer and today's stats stay."
                : "It will be removed from the app. This can't be undone."}
            </span>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="rounded-[10px] border border-line-strong bg-card px-[18px] py-2.5 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={remove.isPending || deleteReply.isPending}
                onClick={confirmDelete}
                className="rounded-[10px] bg-red px-[18px] py-2.5 text-sm font-extrabold text-white disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function ExplanationItem({
  item: e,
  question,
  onDelete,
  onDeleteReply,
}: {
  item: Explanation
  question: Question
  onDelete: () => void
  onDeleteReply: (reply: Reply) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex gap-3 border-t border-line py-4">
      <Avatar name={e.user.name} src={e.user.avatar_url} size={36} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <b className="text-sm">{e.user.name ?? 'User'}</b>
          <span
            className={`rounded-full px-2 py-[3px] text-[11px] font-extrabold ${
              e.is_correct
                ? 'bg-[rgba(31,169,113,.12)] text-green-text'
                : 'bg-[rgba(245,51,63,.1)] text-red-text'
            }`}
          >
            {pickLabel(e, question)}
          </span>
          <span className="ml-auto text-xs text-muted">{timeAgo(e.created_at)}</span>
        </div>
        <p className="text-sm leading-normal text-pretty">{e.explanation}</p>
        <div className="flex items-center gap-3.5 text-xs font-bold text-muted">
          <span className="flex items-center gap-[5px]" title="Votes">
            <ArrowBigUp size={14} strokeWidth={2.2} />
            {number(e.likes_count)}
          </span>
          {e.replies_count > 0 && (
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-[5px] font-extrabold text-brand"
            >
              <MessageCircle size={13} strokeWidth={2.2} />
              {open
                ? 'Hide replies'
                : `View ${number(e.replies_count)} ${e.replies_count > 1 ? 'replies' : 'reply'}`}
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto flex items-center gap-[5px] font-bold text-muted hover:text-red-text"
          >
            <Trash2 size={13} strokeWidth={2.2} />
            Delete
          </button>
        </div>
        {open && <Replies answerId={e.id} total={e.replies_count} onDelete={onDeleteReply} />}
      </div>
    </div>
  )
}

function Replies({
  answerId,
  total,
  onDelete,
}: {
  answerId: number
  total: number
  onDelete: (reply: Reply) => void
}) {
  const replies = useReplies(answerId, true)
  const items = replies.data?.pages.flatMap((p) => p.items)
  return (
    <div className="flex flex-col gap-2.5 pl-1">
      {replies.isPending && <span className="text-xs text-muted">Loading replies…</span>}
      {replies.isError && (
        <span className="text-xs text-red-text">{errorMessage(replies.error)}</span>
      )}
      {items?.map((r) => (
        <div key={r.id} className="flex gap-2.5">
          <Avatar name={r.user.name} src={r.user.avatar_url} size={28} />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-xl bg-page px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <b className="text-[13px]">{r.user.name ?? 'User'}</b>
              <span className="text-muted">{timeAgo(r.created_at)}</span>
              <button
                type="button"
                onClick={() => onDelete(r)}
                className="ml-auto text-xs font-extrabold text-red-text"
              >
                Delete
              </button>
            </div>
            <span className="text-sm leading-normal text-pretty">{r.text}</span>
          </div>
        </div>
      ))}
      {replies.hasNextPage && (
        <button
          type="button"
          disabled={replies.isFetchingNextPage}
          onClick={() => replies.fetchNextPage()}
          className="self-start pl-[38px] text-xs font-extrabold text-brand disabled:text-subtle"
        >
          {replies.isFetchingNextPage
            ? 'Loading…'
            : `Load more replies (${number(total - (items?.length ?? 0))} left)`}
        </button>
      )}
    </div>
  )
}

function Empty({ children }: { children: string }) {
  return <div className="border-t border-line py-10 text-center text-sm text-muted">{children}</div>
}
