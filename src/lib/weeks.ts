import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { plusDays } from './dates'
import type { LessonType, WeekStatus } from '@/services/weeks'

// Weeks start on Monday (UTC), like the backend (private.week_start).
export function weekStartOf(date: string): string {
  const day = parseISO(date).getDay() // 0 = Sunday
  return plusDays(date, -((day + 6) % 7))
}

/** "Nov 2 – 8" or "Oct 26 – Nov 1". */
export function weekRange(weekStart: string): string {
  const start = parseISO(weekStart)
  const end = parseISO(plusDays(weekStart, 6))
  return start.getMonth() === end.getMonth()
    ? `${format(start, 'MMM d')} – ${format(end, 'd')}`
    : `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`
}

/** 2 weeks ago / Last week / This week / Next week / In N weeks. */
export function relativeWeek(weekStart: string, current: string): string {
  const n = Math.round(differenceInCalendarDays(parseISO(weekStart), parseISO(current)) / 7)
  if (n === 0) return 'This week'
  if (n === 1) return 'Next week'
  if (n === -1) return 'Last week'
  return n < 0 ? `${-n} weeks ago` : `In ${n} weeks`
}

export const WEEK_STATUS: Record<WeekStatus, { label: string; bg: string; fg: string }> = {
  ended: { label: 'Ended', bg: '#F2F2F3', fg: '#6E6E73' },
  live: { label: 'Live', bg: '#F2711C', fg: '#FFFFFF' },
  empty: { label: 'Empty', bg: 'rgba(245,51,63,.1)', fg: '#D42A35' },
  scheduled: { label: 'Scheduled', bg: 'rgba(31,169,113,.14)', fg: '#138A5B' },
  draft: { label: 'Draft', bg: '#FFF4EC', fg: '#B4500F' },
}

/** Empty → Plan week, Ended → View, otherwise Edit. */
export function weekAction(status: WeekStatus): string {
  return status === 'empty' ? 'Plan week' : status === 'ended' ? 'View' : 'Edit'
}

export const LESSON_KIND: Record<LessonType, { label: string; bg: string; fg: string; unit: string }> = {
  grammar: { label: 'Grammar', bg: 'rgba(242,113,28,0.1)', fg: '#C25A14', unit: 'cards' },
  vocab: { label: 'Vocabulary', bg: 'rgba(31,169,113,0.12)', fg: '#138A5B', unit: 'words' },
}

export function contentLabel(type: LessonType, count: number): string {
  const unit = LESSON_KIND[type].unit
  return `${count} ${count === 1 ? unit.slice(0, -1) : unit}`
}
