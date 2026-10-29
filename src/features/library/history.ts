import { format, parseISO } from 'date-fns'
import type { QuestionUse } from '@/services/questions'

export const plural = (n: number) => `${n} time${n === 1 ? '' : 's'}`

export function historySummary(uses: QuestionUse[]): string {
  const shown = uses.filter((u) => u.status === 'shown' || u.status === 'live').length
  const first = uses.at(-1) // newest first
  return (
    `Shown ${plural(shown)}` +
    (first ? ` · first used ${format(parseISO(first.date), 'MMM yyyy')}` : '')
  )
}

export function groupByYear(uses: QuestionUse[]): [string, QuestionUse[]][] {
  const years = new Map<string, QuestionUse[]>()
  for (const u of uses) {
    const y = u.date.slice(0, 4)
    years.set(y, [...(years.get(y) ?? []), u])
  }
  return [...years] // already newest first
}
