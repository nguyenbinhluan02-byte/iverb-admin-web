import { format, parseISO } from 'date-fns'
import type { Question, QType } from '@/services/questions'

export const TYPE_LABELS: Record<QType, string> = {
  single: 'Single choice',
  multi: 'Multiple choice',
  fill: 'Fill in the blank',
  order: 'Reorder words',
  dictation: 'Dictation',
}

// Design: "Listening · {short type}" for questions with audio.
const LISTENING_LABELS: Record<QType, string> = {
  single: 'Choice',
  multi: 'Multiple choice',
  fill: 'Fill in',
  order: 'Reorder words',
  dictation: 'Dictation',
}

/** Has audio (dictation always does). */
export function isListening(q: Pick<Question, 'type' | 'content'>): boolean {
  return q.type === 'dictation' || !!q.content.audio_url
}

export function typeLabel(type: QType, listening = false): string {
  return listening || type === 'dictation'
    ? `Listening · ${LISTENING_LABELS[type]}`
    : TYPE_LABELS[type]
}

export const LETTERS = 'ABCDEF'

// "word ." → "word."
const tidy = (s: string) =>
  s
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim()

/**
 * Fill: sentence with `___`; order: the correct sentence; dictation: the
 * sentence to write. Null for choice questions.
 */
export function sentenceOf(q: Pick<Question, 'type' | 'content' | 'answer_key'>): string | null {
  if (q.type === 'fill') return tidy(`${q.content.before ?? ''} ___ ${q.content.after ?? ''}`)
  if (q.type === 'order') return tidy(orderedWords(q).join(' '))
  if (q.type === 'dictation') return q.answer_key?.sentence ?? null
  return null
}

/** Order: tile texts in the correct order (shuffled order when there is no key yet). */
export function orderedWords(q: Pick<Question, 'content' | 'answer_key'>): string[] {
  const tiles = q.content.tiles ?? []
  const order = q.answer_key?.order
  if (!order) return tiles.map((t) => t.text)
  const byId = new Map(tiles.map((t) => [t.id, t.text]))
  return order.map((id) => byId.get(id) ?? '')
}

/** One-line text shown in lists: prompt — sentence. */
export function displayText(q: Question): string {
  const sentence = sentenceOf(q)
  return sentence ? `${q.prompt} — ${sentence}` : q.prompt
}

/** Questions written by app users get the "User submitted" badge. */
export function isUserSubmitted(q: Question): boolean {
  return q.author?.role === 'user'
}

export function authorName(q: Question): string {
  return q.author?.name ?? 'Unknown'
}

/** "Mon, Oct 12" */
export function dayLabel(date: string): string {
  return format(parseISO(date), 'EEE, MMM d')
}
