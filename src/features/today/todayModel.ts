import { formatDistanceStrict } from 'date-fns'
import { LETTERS } from '@/lib/question'
import type { Question } from '@/services/questions'
import type { Explanation, ReportReason, Reports, TodayStats } from '@/services/today'

/** Time left until the next UTC midnight, e.g. "9h 12m". */
export function closesIn(now = new Date()): string {
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  const minutes = Math.max(0, Math.floor((end - now.getTime()) / 60_000))
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

/** Whole percent, null when nobody answered yet. */
export function correctRate(stats: TodayStats): number | null {
  if (!stats.answers_count) return null
  return Math.round((stats.correct_count / stats.answers_count) * 100)
}

export interface OptionBar {
  id: string
  letter: string
  text: string
  count: number
  pct: number
  correct: boolean
}

/** Single / multi: votes per option. Multi percentages are of answers (can sum > 100). */
export function optionBars(q: Question, stats: TodayStats): OptionBar[] {
  const correct = new Set(q.answer_key?.correct ?? [])
  return (q.content.options ?? []).map((o, i) => {
    const count = stats.option_votes[o.id] ?? 0
    return {
      id: o.id,
      letter: LETTERS[i],
      text: o.text,
      count,
      pct: stats.answers_count ? Math.round((count / stats.answers_count) * 100) : 0,
      correct: correct.has(o.id),
    }
  })
}

/** Badge next to the name: what the user answered. */
export function pickLabel(e: Explanation, q: Question): string {
  if (q.type === 'single' || q.type === 'multi') {
    const ids = (q.content.options ?? []).map((o) => o.id)
    const letters = (e.response.option_ids ?? []).map((id) => LETTERS[ids.indexOf(id)] ?? '?')
    return `Picked ${letters.join(', ')}`
  }
  if (q.type === 'fill') return `Typed "${e.response.text ?? ''}"`
  // Same chip as the app: not the whole sentence.
  if (q.type === 'dictation') return e.is_correct ? 'All words right' : 'Missed words'
  return e.is_correct ? 'Correct order' : 'Wrong order'
}

export function timeAgo(iso: string, now = new Date()): string {
  return `${formatDistanceStrict(new Date(iso), now)} ago`
}

/** Same wording as the report sheet in the app. */
export const REPORT_REASONS: Record<ReportReason, string> = {
  spam: 'Spam or advertising',
  misleading: 'Wrong or misleading answer',
  offensive: 'Offensive or abusive language',
  harassment: 'Harassment or bullying',
  other: 'Something else',
}

/** "Reported 3 times · Spam or advertising". */
export function reportLabel({ count, top_reason }: Reports): string {
  const label = `Reported ${count} ${count > 1 ? 'times' : 'time'}`
  return top_reason ? `${label} · ${REPORT_REASONS[top_reason]}` : label
}
