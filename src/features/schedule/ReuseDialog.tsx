import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Modal, ModalClose, ModalTitle } from '@/components/Modal'
import { todayUTC } from '@/lib/dates'
import { errorMessage } from '@/lib/errors'
import { dayLabel, displayText } from '@/lib/question'
import { useQuestions, useScheduleQuestion, type Question } from '@/services/questions'
import { calendarMonth, type CalendarCell } from './reuseCalendar'
import { questionsByDate } from './scheduleModel'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const DOT: Record<CalendarCell['state'], string> = {
  empty: 'transparent',
  scheduled: 'var(--color-brand)',
  draft: 'var(--color-brand-light)',
  past: 'var(--color-disabled)',
  today: 'var(--color-ink)',
}

function cellTitle(c: CalendarCell): string {
  if (c.state === 'today') return 'Today · live'
  if (c.state === 'past') return 'Past'
  if (c.state === 'empty') return 'Empty — click to schedule'
  return `${c.state === 'draft' ? 'Draft' : 'Scheduled'}: ${c.question!.prompt}`
}

// Design: "Reuse calendar" modal (Library → Reuse, View → Reuse).
export function ReuseDialog({
  question,
  onClose,
}: {
  question: Question | null
  onClose: () => void
}) {
  return (
    <Modal open={!!question} onClose={onClose} maxWidth={440}>
      {question && <ReuseCalendar key={question.id} question={question} onClose={onClose} />}
    </Modal>
  )
}

function ReuseCalendar({ question, onClose }: { question: Question; onClose: () => void }) {
  const { data: questions = [] } = useQuestions()
  const schedule = useScheduleQuestion()
  const today = todayUTC()
  const [offset, setOffset] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)

  const byDate = useMemo(() => questionsByDate(questions), [questions])
  const month = calendarMonth(today, offset, byDate)

  const confirm = async () => {
    if (!selected) return
    try {
      await schedule.mutateAsync({ id: question.id, date: selected })
      toast.success(`Scheduled for ${dayLabel(selected)}`)
      onClose()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const stepper =
    'flex size-8 items-center justify-center rounded-[9px] border border-line-strong bg-card text-ink hover:bg-page disabled:opacity-40'

  return (
    <>
      <div className="flex items-start gap-3 px-[22px] pt-5 pb-3.5">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-extrabold tracking-[.06em] text-muted uppercase">
            Reuse question
          </div>
          <ModalTitle className="mt-1.5 text-[15px] leading-[1.4] font-bold text-pretty">
            {displayText(question)}
          </ModalTitle>
        </div>
        <ModalClose />
      </div>

      <div className="flex flex-col gap-3 px-[22px] pb-4">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            title="Previous month"
            disabled={offset === 0}
            onClick={() => setOffset(offset - 1)}
            className={stepper}
          >
            <ChevronLeft size={16} strokeWidth={2.4} />
          </button>
          <span className="text-[15px] font-extrabold">{month.label}</span>
          <button
            type="button"
            title="Next month"
            onClick={() => setOffset(offset + 1)}
            className={stepper}
          >
            <ChevronRight size={16} strokeWidth={2.4} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((w) => (
            <span
              key={w}
              className="py-1 text-center text-[11px] font-extrabold tracking-[.04em] text-subtle"
            >
              {w}
            </span>
          ))}
          {Array.from({ length: month.lead }, (_, i) => (
            <span key={`lead-${i}`} />
          ))}
          {month.cells.map((c) => {
            const on = selected === c.date
            const free = c.state === 'empty'
            const look = on
              ? 'border-solid border-brand bg-brand text-white font-extrabold'
              : free
                ? 'border-dashed border-disabled bg-card text-ink font-extrabold'
                : c.state === 'past' || c.state === 'today'
                  ? 'border-transparent bg-[#FAFAFA] text-disabled font-semibold'
                  : 'border-transparent bg-hover text-subtle font-semibold'
            return (
              <button
                key={c.date}
                type="button"
                disabled={!free}
                title={cellTitle(c)}
                onClick={() => setSelected(c.date)}
                className={`flex h-[46px] flex-col items-center justify-center gap-[3px] rounded-[10px] border-[1.5px] text-sm disabled:cursor-not-allowed ${look}`}
              >
                <span>{c.day}</span>
                <span
                  className="size-[5px] rounded-full"
                  style={{ background: on ? 'transparent' : DOT[c.state] }}
                />
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-3.5 text-xs font-semibold text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded border-[1.5px] border-dashed border-disabled bg-card" />
            Empty
          </span>
          <Legend color={DOT.scheduled}>Scheduled</Legend>
          <Legend color={DOT.draft}>Draft</Legend>
          <Legend color={DOT.past}>Past</Legend>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-line px-[22px] py-3.5">
        <span className={`text-[13px] font-bold ${selected ? 'text-ink' : 'text-subtle'}`}>
          {selected ? `Schedule for ${dayLabel(selected)}` : 'Pick an empty day'}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-line-strong bg-card px-4 py-2.5 text-sm font-extrabold whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selected || schedule.isPending}
            onClick={confirm}
            className="rounded-[10px] bg-brand px-4 py-2.5 text-sm font-extrabold whitespace-nowrap text-white hover:bg-brand-hover disabled:bg-line-strong disabled:text-subtle"
          >
            Schedule
          </button>
        </div>
      </div>
    </>
  )
}

function Legend({ color, children }: { color: string; children: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {children}
    </span>
  )
}
