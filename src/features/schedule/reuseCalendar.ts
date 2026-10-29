import { addMonths, format, getDay, parseISO, startOfMonth } from 'date-fns'
import type { Question } from '@/services/questions'
import { monthDates } from './scheduleModel'

export type CellState = 'empty' | 'scheduled' | 'draft' | 'past' | 'today'

export interface CalendarCell {
  date: string
  day: number
  state: CellState
  question: Question | null
}

/** Leading blanks (Mon-first) + one cell per day of the month. */
export function calendarMonth(
  today: string,
  offset: number,
  byDate: Map<string, Question>,
): { label: string; lead: number; cells: CalendarCell[] } {
  const start = startOfMonth(addMonths(parseISO(today), offset))
  const cells = monthDates(today, offset).map((date) => {
    const question = byDate.get(date) ?? null
    const state: CellState =
      date < today
        ? 'past'
        : date === today
          ? 'today'
          : !question
            ? 'empty'
            : question.status === 'draft'
              ? 'draft'
              : 'scheduled'
    return { date, day: Number(date.slice(8)), state, question }
  })
  return { label: format(start, 'MMM yyyy'), lead: (getDay(start) + 6) % 7, cells }
}
