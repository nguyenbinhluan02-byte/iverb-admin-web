import { dayLabel, displayText, sentenceOf, TYPE_LABELS } from '@/lib/question'
import type { Question } from '@/services/questions'
import type { FormValues } from './formModel'

// Duplicate check from the design prototype: word overlap / smaller set ≥ 60%.
const STOP = new Set(
  'a an the of to in on at for and or is are was were be been what which who choose correct form forms sentence sentences complete fill put words word order verb verbs past simple participle present perfect continuous these this that with use uses i you he she we they it my your his her our their has have had do does did not'.split(
    ' ',
  ),
)

export function tokens(parts: (string | null | undefined)[]): Set<string> {
  return new Set(
    parts
      .join(' ')
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOP.has(w)),
  )
}

export function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size < 2 || b.size < 2) return 0
  let shared = 0
  a.forEach((w) => b.has(w) && shared++)
  return shared / Math.min(a.size, b.size)
}

const formTokens = (v: FormValues) =>
  tokens([v.prompt, v.sentence, v.answer, v.hint, ...v.options.map((o) => o.text)])

const questionTokens = (q: Question) =>
  tokens([
    q.prompt,
    sentenceOf(q),
    ...(q.answer_key?.accepted ?? []),
    q.content.hint,
    ...(q.content.options ?? []).map((o) => o.text),
  ])

export interface SimilarQuestion {
  question: Question
  text: string
  when: string
  typeLabel: string
  pct: number
}

export function whenLabel(q: Question): string {
  if (q.status === 'live') return 'Live today'
  if (!q.date) return 'Not scheduled'
  return `${q.status === 'published' ? 'Shown' : 'Scheduled'} ${dayLabel(q.date)}`
}

export function findSimilar(
  values: FormValues,
  questions: Question[],
  excludeIds: number[],
): SimilarQuestion[] {
  const mine = formTokens(values)
  return questions
    .filter((q) => !excludeIds.includes(q.id))
    .map((q) => ({ q, score: similarity(mine, questionTokens(q)) }))
    .filter((m) => m.score >= 0.6)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ q, score }) => ({
      question: q,
      text: displayText(q),
      when: whenLabel(q),
      typeLabel: TYPE_LABELS[q.type],
      pct: Math.round(score * 100),
    }))
}
