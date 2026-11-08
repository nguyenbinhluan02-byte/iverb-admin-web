import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { plusDays, todayUTC } from '@/lib/dates'
import { contentLabel, LESSON_KIND, relativeWeek, weekAction, weekRange, weekStartOf } from '@/lib/weeks'
import { useLessonWeeks, useWeeksNeedingWork } from '@/services/weeks'
import { WeekStatusBadge } from './WeekStatusBadge'

// Design: Weekly Lessons.dc.html "WEEKS" (changes since v1 §3). Two weeks back,
// then every week up to the last one planned (at least next week). "Add week"
// shows one more empty week after the last row; it is saved when planned.

const COLS = 'grid-cols-[130px_minmax(200px,1fr)_80px_140px_96px_96px]'

export function WeeksPage() {
  const navigate = useNavigate()
  const current = weekStartOf(todayUTC())
  const { data: needing } = useWeeksNeedingWork()
  const [extra, setExtra] = useState(0)

  const lastPlanned = needing?.last_planned_week_start
  const base = lastPlanned && lastPlanned > plusDays(current, 7) ? lastPlanned : plusDays(current, 7)
  const from = plusDays(current, -14)
  const to = plusDays(base, 7 * extra)
  const { data: weeks, isLoading, error } = useLessonWeeks(from, to, !!needing)

  return (
    <div className="mx-auto flex max-w-[1240px] flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.01em]">Weeks</h1>
          <span className="text-sm text-muted">One lesson per week, starting Monday · 7 daily questions tied to it</span>
        </div>
        <button
          onClick={() => setExtra((x) => x + 1)}
          className="flex items-center gap-2 rounded-[10px] bg-ink px-4 py-2.5 text-sm font-bold whitespace-nowrap text-white"
        >
          <Plus size={16} strokeWidth={2.4} />
          Add week
        </button>
      </div>

      <div className="overflow-x-auto overflow-y-hidden rounded-[18px] border border-line bg-card">
        <div
          className={`grid min-w-[860px] ${COLS} gap-4 border-b border-line bg-[#FAFAFA] px-5 py-3 text-xs font-extrabold tracking-[.04em] text-subtle uppercase`}
        >
          <span>Week</span>
          <span>Lesson</span>
          <span>Content</span>
          <span>Questions</span>
          <span>Status</span>
          <span />
        </div>
        {isLoading && <div className="px-5 py-4 text-sm text-muted">Loading…</div>}
        {error && <div className="px-5 py-4 text-sm text-red-text">Could not load weeks.</div>}
        {(weeks ?? []).map((w) => {
          const kind = w.lesson ? LESSON_KIND[w.lesson.type] : null
          const q = w.question_days.filter(Boolean).length
          return (
            <div
              key={w.week_start}
              className={`grid min-w-[860px] ${COLS} items-center gap-4 border-t border-page px-5 py-3.5`}
              style={{ background: w.status === 'live' ? '#FFFAF6' : '#fff' }}
            >
              <span className="flex flex-col leading-[1.3]">
                <span className="text-sm font-extrabold">{weekRange(w.week_start)}</span>
                <span className="text-xs text-subtle">{relativeWeek(w.week_start, current)}</span>
              </span>
              <span className="flex min-w-0 items-center gap-2.5">
                {kind && (
                  <span
                    className="flex-none rounded-full px-2 py-[3px] text-[11px] font-extrabold tracking-[.05em] whitespace-nowrap uppercase"
                    style={{ background: kind.bg, color: kind.fg }}
                  >
                    {kind.label}
                  </span>
                )}
                <span className={`truncate text-sm font-bold ${w.lesson ? 'text-ink' : 'text-subtle'}`}>
                  {w.lesson?.title ?? 'No lesson yet'}
                </span>
              </span>
              <span className="text-[13px] text-muted">
                {w.lesson && w.lesson.cards_count > 0 ? contentLabel(w.lesson.type, w.lesson.cards_count) : '—'}
              </span>
              <span className="flex items-center gap-2">
                <span className="flex gap-[3px]">
                  {w.question_days.map((has, i) => (
                    <span key={i} className="size-[9px] rounded-full" style={{ background: has ? '#1FA971' : '#E4E4E7' }} />
                  ))}
                </span>
                <span className="text-[13px] font-bold tabular-nums">{q}/7</span>
              </span>
              <span>
                <WeekStatusBadge status={w.status} />
              </span>
              <button
                onClick={() => navigate(`/weeks/${w.week_start}`)}
                className="justify-self-end rounded-[9px] border border-line-strong bg-card px-3.5 py-2 text-[13px] font-bold whitespace-nowrap"
              >
                {weekAction(w.status)}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
