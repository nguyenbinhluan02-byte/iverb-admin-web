import { format, parseISO } from 'date-fns'
import { useNavigate } from 'react-router'
import { todayUTC, plusDays } from '@/lib/dates'
import { contentLabel, LESSON_KIND, weekAction, weekRange, weekStartOf } from '@/lib/weeks'
import { useLessonWeeks, useWeekDashboard, useWeeksNeedingWork } from '@/services/weeks'
import { WeekStatusBadge } from './WeekStatusBadge'

// Design: Weekly Lessons.dc.html "THIS WEEK" (changes since v1 §2).

const n = (value: number) => value.toLocaleString('en-US')

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-line bg-card px-5 py-[18px]">
      <span className="text-[13px] font-semibold text-muted">{label}</span>
      <span className="text-[30px] font-extrabold tracking-[-0.02em]">{value}</span>
      {note && <span className="text-xs text-muted">{note}</span>}
    </div>
  )
}

function Bar({ percent, color }: { percent: number; color: string }) {
  return (
    <span className="h-[5px] w-24 overflow-hidden rounded-[3px] bg-page">
      <span className="block h-full" style={{ width: `${Math.max(0, Math.min(100, percent))}%`, background: color }} />
    </span>
  )
}

export function ThisWeekPage() {
  const navigate = useNavigate()
  const current = weekStartOf(todayUTC())
  const { data: week, isLoading, error } = useWeekDashboard()
  const { data: needing } = useWeeksNeedingWork()
  const { data: upcoming } = useLessonWeeks(plusDays(current, 7), plusDays(current, 21))

  const open = (weekStart: string, tab?: 'questions') =>
    navigate(`/weeks/${weekStart}${tab ? '?tab=questions' : ''}`)

  if (isLoading) return <div className="p-8 text-sm text-muted">Loading…</div>
  if (error || !week) return <div className="p-8 text-sm text-red-text">Could not load this week.</div>

  const lesson = week.lesson
  const gap = upcoming?.find((w) => w.week_start === needing?.next_week_start)
  const reachedMax = Math.max(1, week.stats.started, ...week.drop_off.map((d) => d.reached))

  return (
    <div className="mx-auto flex max-w-[1240px] flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-extrabold tracking-[.06em] text-brand uppercase">
            <span className="size-2 rounded-full bg-brand" />
            Live · Day {week.day ?? '–'} of 7
          </div>
          <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.01em]">{weekRange(week.week_start)}</h1>
          <span className="text-sm text-muted">
            {lesson ? `${LESSON_KIND[lesson.type].label} · ${lesson.title}` : 'No lesson this week'}
          </span>
        </div>
        <button
          onClick={() => open(week.week_start)}
          className="rounded-[10px] border border-line-strong bg-card px-4 py-2.5 text-sm font-bold whitespace-nowrap"
        >
          Edit this week
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3.5">
        <Stat label="Finished the lesson" value={n(week.stats.finished)} note="users" />
        <Stat label="Answers this week" value={n(week.stats.answers)} />
        <Stat
          label="Average correct"
          value={week.stats.average_correct == null ? '–' : `${week.stats.average_correct}%`}
        />
        <div className="flex flex-col gap-1.5 rounded-2xl border border-brand-tint-border bg-brand-tint px-5 py-[18px]">
          <span className="text-[13px] font-bold text-brand-deeper">Next week needing work</span>
          {needing?.next_week_start ? (
            <>
              <span className="text-[22px] leading-[1.25] font-extrabold">{weekRange(needing.next_week_start)}</span>
              <button
                onClick={() => open(needing.next_week_start!)}
                className="self-start text-xs font-extrabold text-brand-deeper"
              >
                {gap ? weekAction(gap.status) : 'Plan week'} →
              </button>
            </>
          ) : (
            <span className="text-[22px] leading-[1.25] font-extrabold">All set</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-[18px]">
        <section className="flex flex-col gap-4 rounded-[18px] border border-line bg-card p-5">
          <div className="flex items-center justify-between gap-2.5">
            <h2 className="m-0 text-[17px] font-extrabold">Lesson drop-off</h2>
            <span className="text-[13px] text-muted">Users who reached each card</span>
          </div>
          <div className="flex flex-col">
            {week.drop_off.length === 0 && (
              <span className="border-t border-page py-2.5 text-sm text-muted">No cards yet.</span>
            )}
            {week.drop_off.map((card, i) => {
              const percent = (100 * card.reached) / reachedMax
              return (
                <div
                  key={card.card_id}
                  className="grid grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-3 border-t border-page py-2.5"
                >
                  <span className="text-xs font-extrabold text-subtle">{i + 1}</span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-bold">{card.label ?? card.heading}</span>
                    {card.label && <span className="truncate text-xs text-subtle">{card.heading}</span>}
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="text-[13px] font-extrabold whitespace-nowrap tabular-nums">{n(card.reached)}</span>
                    <Bar percent={percent} color={percent < 75 ? '#F2711C' : '#1FA971'} />
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-[18px] border border-line bg-card p-5">
          <div className="flex items-center justify-between gap-2.5">
            <h2 className="m-0 text-[17px] font-extrabold">Daily questions</h2>
            <button onClick={() => open(week.week_start, 'questions')} className="text-[13px] font-extrabold text-brand">
              Edit questions
            </button>
          </div>
          <div className="flex flex-col">
            {week.days.map((d) => {
              const rate = d.percent_correct ?? 0
              return (
                <div
                  key={d.date}
                  className="grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-3 border-t border-page py-2.5"
                >
                  <span className="flex flex-col leading-[1.3]">
                    <span className={`text-[13px] font-extrabold ${d.today ? 'text-brand' : 'text-ink'}`}>
                      {d.today ? 'Today' : format(parseISO(d.date), 'EEE')}
                    </span>
                    <span className="text-xs text-subtle">{format(parseISO(d.date), 'MMM d')}</span>
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className={`truncate text-sm font-semibold ${d.question ? '' : 'text-subtle'}`}>
                      {d.question?.prompt ?? 'No question'}
                    </span>
                    {d.today && <span className="text-xs text-subtle">Today · still open</span>}
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="text-[11px] font-extrabold tracking-[.05em] text-subtle uppercase">Correct</span>
                    <span className="text-[13px] font-extrabold whitespace-nowrap tabular-nums">
                      {n(d.correct)}
                      <span className="font-semibold text-subtle">/{n(d.answers)}</span>
                    </span>
                    <Bar percent={rate} color={rate < 60 ? '#F2711C' : '#1FA971'} />
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-3 rounded-[18px] border border-line bg-card p-5">
        <div className="flex items-center justify-between gap-2.5">
          <h2 className="m-0 text-[17px] font-extrabold">Coming up</h2>
          <button onClick={() => navigate('/weeks')} className="text-[13px] font-extrabold text-brand">
            All weeks
          </button>
        </div>
        {(upcoming ?? []).map((w) => {
          const q = w.question_days.filter(Boolean).length
          return (
            <div key={w.week_start} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-page py-3">
              <span className="flex-[0_0_120px] text-sm font-extrabold whitespace-nowrap">{weekRange(w.week_start)}</span>
              <span className="flex min-w-0 flex-[1_1_200px] flex-col gap-0.5">
                <span className={`truncate text-sm font-bold ${w.lesson ? 'text-ink' : 'text-subtle'}`}>
                  {w.lesson ? `${LESSON_KIND[w.lesson.type].label} · ${w.lesson.title}` : 'No lesson yet'}
                </span>
                <span className="text-xs text-subtle">
                  {w.lesson && w.lesson.cards_count > 0
                    ? contentLabel(w.lesson.type, w.lesson.cards_count)
                    : 'No lesson content'}{' '}
                  · {q}/7 questions
                </span>
              </span>
              <WeekStatusBadge status={w.status} />
              <button
                onClick={() => open(w.week_start)}
                className="rounded-[9px] border border-line-strong bg-card px-3.5 py-2 text-[13px] font-bold whitespace-nowrap"
              >
                {weekAction(w.status)}
              </button>
            </div>
          )
        })}
      </section>
    </div>
  )
}
