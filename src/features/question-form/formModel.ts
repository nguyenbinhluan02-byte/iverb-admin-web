import { z } from 'zod'
import { orderedWords, sentenceOf } from '@/lib/question'
import type { AnswerKey, Question, QuestionContent, QType } from '@/services/questions'

export interface OptionValue {
  text: string
  correct: boolean
}

// Flat form state for all four types (design: "New / Edit question").
export interface FormValues {
  type: QType
  prompt: string
  options: OptionValue[] // single / multi
  sentence: string // fill: with ___; order: the correct sentence
  answer: string // fill: accepted answers separated by "/"
  hint: string // fill
  explanation: string
  authorName: string
  date: string | null
}

export const MIN_OPTIONS = 2
export const MAX_OPTIONS = 6
export const BLANK = '___'

export function emptyForm(date: string | null, authorName: string): FormValues {
  return {
    type: 'single',
    prompt: '',
    options: Array.from({ length: 4 }, () => ({ text: '', correct: false })),
    sentence: '',
    answer: '',
    hint: '',
    explanation: '',
    authorName,
    date,
  }
}

export function fromQuestion(q: Question, date: string | null): FormValues {
  const correct = new Set(q.answer_key?.correct ?? [])
  return {
    type: q.type,
    prompt: q.prompt,
    options: (q.content.options ?? []).map((o) => ({ text: o.text, correct: correct.has(o.id) })),
    sentence: q.type === 'order' ? orderedWords(q).join(' ') : (sentenceOf(q) ?? ''),
    answer: (q.answer_key?.accepted ?? []).join(' / '),
    hint: q.content.hint ?? '',
    explanation: q.explanation ?? '',
    authorName: q.author?.name ?? '',
    date,
  }
}

/** Switching type keeps what still fits; single keeps only the first correct option. */
export function switchType(values: FormValues, type: QType): Partial<FormValues> {
  if (type !== 'single') return { type }
  let seen = false
  const options = values.options.map((o) => {
    const correct = o.correct && !seen
    if (correct) seen = true
    return { ...o, correct }
  })
  return { type, options }
}

export const words = (sentence: string) => sentence.trim().split(/\s+/).filter(Boolean)
export const filledOptions = (values: FormValues) => values.options.filter((o) => o.text.trim())
export const acceptedAnswers = (answer: string) => [
  ...new Set(
    answer
      .split('/')
      .map((a) => a.trim())
      .filter(Boolean),
  ),
]

// Everything needed to schedule (design `valid(f)`).
const publishable = z
  .object({
    type: z.enum(['single', 'multi', 'fill', 'order']),
    prompt: z.string().trim().min(1),
    options: z.array(z.object({ text: z.string(), correct: z.boolean() })),
    sentence: z.string(),
    answer: z.string(),
  })
  .superRefine((v, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: 'custom', message })
    if (v.type === 'single' || v.type === 'multi') {
      const filled = v.options.filter((o) => o.text.trim())
      const correct = filled.filter((o) => o.correct).length
      if (filled.length < MIN_OPTIONS) fail('Add at least two options.')
      if (v.type === 'single' ? correct !== 1 : correct < 1) fail('Mark the correct answer.')
      if (new Set(filled.map((o) => o.text.trim().toLowerCase())).size !== filled.length)
        fail('Options must be different.')
    } else if (v.type === 'fill') {
      if (!v.sentence.includes(BLANK)) fail(`Add ${BLANK} where the blank should go.`)
      if (!acceptedAnswers(v.answer).length) fail('Add the correct answer.')
    } else if (words(v.sentence).length < 3) {
      fail('The sentence needs at least 3 words.')
    }
  })

export function canPublish(values: FormValues): boolean {
  return publishable.safeParse(values).success
}

export function canSaveDraft(values: FormValues): boolean {
  return !!values.prompt.trim()
}

/** Whether the key part alone is complete (a draft stores the key only then). */
function keyComplete(values: FormValues): boolean {
  return publishable.safeParse({ ...values, prompt: 'x' }).success
}

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

// Shuffle so the tiles never start in the correct order (when possible).
export function shuffleTiles<T>(items: T[], random = Math.random): T[] {
  if (items.length < 2) return [...items]
  for (;;) {
    const out = [...items]
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    if (out.some((x, i) => x !== items[i]) || new Set(items).size === 1) return out
  }
}

/**
 * content + answer_key for the RPC. When the visible question did not change,
 * the original JSON is sent back as is (stable ids, same tile shuffle), so an
 * answered question passes the backend's `has_answers` check.
 */
export function buildPayload(
  values: FormValues,
  original: Question | null,
  random = Math.random,
): { content: QuestionContent; answer_key: AnswerKey | null } {
  const built = build(values, random)
  if (original && original.type === values.type) {
    const before = fromQuestion(original, null)
    const unchanged =
      values.type === 'single' || values.type === 'multi'
        ? sameJson(clean(before.options), clean(values.options))
        : values.type === 'fill'
          ? sameJson(built.content, original.content) &&
            sameJson(built.answer_key, original.answer_key)
          : sameJson(words(before.sentence), words(values.sentence))
    if (unchanged) return { content: original.content, answer_key: original.answer_key }
  }
  return { ...built, answer_key: keyComplete(values) ? built.answer_key : null }
}

const clean = (options: OptionValue[]) =>
  options.filter((o) => o.text.trim()).map((o) => ({ text: o.text.trim(), correct: o.correct }))

function build(values: FormValues, random: () => number) {
  if (values.type === 'single' || values.type === 'multi') {
    const options = clean(values.options).map((o, i) => ({ id: 'abcdef'[i], ...o }))
    return {
      content: { options: options.map(({ id, text }) => ({ id, text })) },
      answer_key: { correct: options.filter((o) => o.correct).map((o) => o.id) } as AnswerKey,
    }
  }
  if (values.type === 'fill') {
    const i = values.sentence.indexOf(BLANK)
    const before = (i >= 0 ? values.sentence.slice(0, i) : values.sentence).trim()
    const after = i >= 0 ? values.sentence.slice(i + BLANK.length).trim() : ''
    const content: QuestionContent = { before, after }
    if (values.hint.trim()) content.hint = values.hint.trim()
    return { content, answer_key: { accepted: acceptedAnswers(values.answer) } as AnswerKey }
  }
  const tiles = words(values.sentence).map((text, i) => ({ id: `t${i + 1}`, text }))
  return {
    content: { tiles: shuffleTiles(tiles, random) },
    answer_key: { order: tiles.map((t) => t.id) } as AnswerKey,
  }
}
