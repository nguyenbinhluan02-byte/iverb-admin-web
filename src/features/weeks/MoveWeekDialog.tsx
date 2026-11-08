import { useState } from 'react'
import { toast } from 'sonner'
import { Modal, ModalTitle } from '@/components/Modal'
import { plusDays, todayUTC } from '@/lib/dates'
import { errorMessage } from '@/lib/errors'
import { LESSON_KIND, WEEK_STATUS, weekRange, weekStartOf } from '@/lib/weeks'
import { useLessonWeeks, useMoveWeek, useWeeksNeedingWork, type LessonSummary } from '@/services/weeks'

// "Move lesson to another week" (design changes since v1 §3.1). Targets: every
// upcoming week except the source (up to the last planned one + 4 empty
// weeks). A planned target swaps with the source.

const EXTRA_WEEKS = 4

export function MoveWeekDialog({
  weekStart,
  lesson,
  onClose,
  onMoved,
}: {
  /** null = closed. */
  weekStart: string | null
  lesson: LessonSummary | null
  onClose: () => void
  onMoved?: (to: string) => void
}) {
  return (
    <Modal open={!!weekStart} onClose={onClose} maxWidth={560} maxHeight={720}>
      {weekStart && (
        <Picker key={weekStart} weekStart={weekStart} lesson={lesson} onClose={onClose} onMoved={onMoved} />
      )}
    </Modal>
  )
}

function Picker({
  weekStart,
  lesson,
  onClose,
  onMoved,
}: {
  weekStart: string
  lesson: LessonSummary | null
  onClose: () => void
  onMoved?: (to: string) => void
}) {
  const next = plusDays(weekStartOf(todayUTC()), 7)
  const { data: needing } = useWeeksNeedingWork()
  const last = needing?.last_planned_week_start && needing.last_planned_week_start > next ? needing.last_planned_week_start : next
  const { data: weeks } = useLessonWeeks(next, plusDays(last, 7 * EXTRA_WEEKS), !!needing)
  const move = useMoveWeek()
  const [target, setTarget] = useState<string | null>(null)

  const targets = (weeks ?? []).filter((w) => w.week_start !== weekStart)
  const picked = targets.find((w) => w.week_start === target) ?? null
  const swap = !!picked && picked.status !== 'empty'
  const srcRange = weekRange(weekStart)
  const srcTitle = lesson ? `${LESSON_KIND[lesson.type].label} · ${lesson.title}` : 'Daily questions'

  const confirm = async () => {
    if (!picked) return
    try {
      const r = await move.mutateAsync({ from: weekStart, to: picked.week_start })
      toast.success(
        r.swapped ? `Swapped ${srcRange} and ${weekRange(picked.week_start)}` : `Moved to ${weekRange(picked.week_start)}`,
      )
      onClose()
      onMoved?.(picked.week_start)
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1 border-b border-line px-[22px] pt-5 pb-3.5">
        <ModalTitle className="text-lg font-extrabold">Move lesson to another week</ModalTitle>
        <span className="text-[13px] text-muted">
          <b className="text-ink">{srcTitle}</b> · now {srcRange}. The lesson, its 7 daily questions, translations and
          pronunciation move together.
        </span>
      </div>

      <div className="flex flex-auto flex-col gap-1 overflow-y-auto px-3 py-2.5">
        {!weeks && <span className="p-3 text-sm text-muted">Loading…</span>}
        {targets.map((w) => {
          const on = w.week_start === target
          const st = WEEK_STATUS[w.status]
          return (
            <button
              key={w.week_start}
              type="button"
              onClick={() => setTarget(w.week_start)}
              className="flex w-full items-center gap-3 rounded-xl border-[1.5px] px-3.5 py-3 text-left"
              style={{ borderColor: on ? '#F2711C' : 'transparent', background: on ? 'rgba(242,113,28,0.06)' : '#fff' }}
            >
              <span
                className="flex size-[18px] flex-none items-center justify-center rounded-full border-2"
                style={{ borderColor: on ? '#F2711C' : '#D4D4D8' }}
              >
                <span className="size-2 rounded-full" style={{ background: on ? '#F2711C' : 'transparent' }} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-extrabold">{weekRange(w.week_start)}</span>
                <span className={`truncate text-[13px] ${w.lesson ? 'text-ink' : 'text-subtle'}`}>
                  {w.lesson ? `${LESSON_KIND[w.lesson.type].label} · ${w.lesson.title}` : 'No lesson yet'}
                </span>
              </span>
              <span
                className="rounded-full px-2.5 py-1 text-xs font-extrabold whitespace-nowrap"
                style={{ background: st.bg, color: st.fg }}
              >
                {st.label}
              </span>
            </button>
          )
        })}
      </div>

      {swap && picked && (
        <div className="mx-[22px] mb-3 rounded-xl bg-brand-tint px-3.5 py-3 text-[13px] font-semibold text-brand-deeper">
          {weekRange(picked.week_start)} already has “{picked.lesson?.title ?? 'daily questions'}”. The two weeks will
          swap: that lesson moves to {srcRange}.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-line px-[22px] py-3.5">
        <span className="text-xs text-subtle">Live and ended weeks can’t be moved.</span>
        <span className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-line-strong bg-card px-4 py-2.5 text-sm font-extrabold whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!picked || move.isPending}
            onClick={confirm}
            className="rounded-[10px] px-4 py-2.5 text-sm font-extrabold whitespace-nowrap text-white disabled:cursor-not-allowed"
            style={{ background: picked ? '#F2711C' : '#C9C9CE' }}
          >
            {!picked ? 'Choose a week' : swap ? 'Swap weeks' : 'Move lesson'}
          </button>
        </span>
      </div>
    </>
  )
}
