import { addMonths, endOfMonth, format, parseISO, startOfMonth } from 'date-fns'
import { nextDays } from '@/lib/dates'
import type { Question } from '@/services/questions'

export type DayKind = 'past' | 'live' | 'future'

export interface ScheduleDay {
  date: string
  kind: DayKind
  question: Question | null
}

export const SCHEDULE_DAYS = 14

export function questionsByDate(questions: Question[]): Map<string, Question> {
  const map = new Map<string, Question>()
  for (const q of questions) if (q.date) map.set(q.date, q)
  return map
}

const kindOf = (date: string, today: string): DayKind =>
  date < today ? 'past' : date === today ? 'live' : 'future'

/** Every day of the month `offset` months from today's month. */
export function monthDates(today: string, offset: number): string[] {
  const start = startOfMonth(addMonths(parseISO(today), offset))
  const days = endOfMonth(start).getDate()
  return Array.from({ length: days }, (_, i) =>
    format(new Date(start.getFullYear(), start.getMonth(), i + 1), 'yyyy-MM-dd'),
  )
}

export function monthLabel(today: string, offset: number): string {
  return format(addMonths(parseISO(today), offset), 'MMM yyyy')
}

export function buildDays(
  dates: string[],
  today: string,
  byDate: Map<string, Question>,
): ScheduleDay[] {
  return dates.map((date) => ({
    date,
    kind: kindOf(date, today),
    question: byDate.get(date) ?? null,
  }))
}

/** Legend counts — future days only. */
export function countDays(days: ScheduleDay[]) {
  const future = days.filter((d) => d.kind === 'future')
  return {
    scheduled: future.filter((d) => d.question && d.question.status !== 'draft').length,
    draft: future.filter((d) => d.question?.status === 'draft').length,
    empty: future.filter((d) => !d.question).length,
  }
}

export function coverageColor(d: ScheduleDay): string {
  if (d.kind === 'past') return d.question ? 'var(--color-disabled)' : 'var(--color-page)'
  if (d.kind === 'live') return 'var(--color-ink)'
  if (!d.question) return 'var(--color-line-strong)'
  return d.question.status === 'draft' ? 'var(--color-brand-light)' : 'var(--color-brand)'
}

/** Empty days in the next 14 (sidebar badge, "Next empty day"). */
export function emptyDays(questions: Question[], today: string): string[] {
  const byDate = questionsByDate(questions)
  return nextDays(today, SCHEDULE_DAYS).filter((d) => !byDate.has(d))
}

/** "For tomorrow · Wed, Oct 28" style prefix. */
export function relativeDay(date: string, today: string): string {
  return nextDays(today, 1)[0] === date ? 'tomorrow · ' : ''
}
