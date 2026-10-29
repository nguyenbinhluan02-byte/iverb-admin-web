import { addDays, format, parseISO } from 'date-fns'

// Days are UTC calendar days, like the backend (`private.today()`).
export function todayUTC(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}

export function plusDays(date: string, days: number): string {
  return format(addDays(parseISO(date), days), 'yyyy-MM-dd')
}

/** The next `count` days after `from` (tomorrow first). */
export function nextDays(from: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => plusDays(from, i + 1))
}
