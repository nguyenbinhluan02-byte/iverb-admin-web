import { makeQuestion } from '@/test/fixtures'
import {
  buildPayload,
  canPublish,
  canSaveDraft,
  emptyForm,
  fromQuestion,
  shuffleTiles,
  switchType,
  type FormValues,
} from './formModel'

const base = emptyForm('2026-11-01', 'Linh Tran')
const choice = (over: Partial<FormValues>): FormValues => ({
  ...base,
  prompt: 'Past of "go"?',
  options: [
    { text: 'went', correct: true },
    { text: 'gone', correct: false },
    { text: '', correct: false },
  ],
  ...over,
})
const fixed = () => 0 // deterministic shuffle

describe('validation', () => {
  it('draft needs only the question text', () => {
    expect(canSaveDraft(base)).toBe(false)
    expect(canSaveDraft({ ...base, prompt: ' x ' })).toBe(true)
  })

  it('single: two filled options, exactly one correct', () => {
    expect(canPublish(choice({}))).toBe(true)
    expect(
      canPublish(
        choice({
          options: [
            { text: 'went', correct: true },
            { text: '', correct: false },
          ],
        }),
      ),
    ).toBe(false)
    expect(
      canPublish(
        choice({
          options: [
            { text: 'a', correct: true },
            { text: 'b', correct: true },
          ],
        }),
      ),
    ).toBe(false)
    expect(
      canPublish(
        choice({
          type: 'multi',
          options: [
            { text: 'a', correct: true },
            { text: 'b', correct: true },
          ],
        }),
      ),
    ).toBe(true)
    expect(canPublish(choice({ prompt: ' ' }))).toBe(false)
  })

  it('fill: needs ___ and an answer', () => {
    const fill = { ...base, type: 'fill' as const, prompt: 'Fill', answer: 'eaten' }
    expect(canPublish({ ...fill, sentence: 'I have never ___ sushi.' })).toBe(true)
    expect(canPublish({ ...fill, sentence: 'I have never sushi.' })).toBe(false)
    expect(canPublish({ ...fill, sentence: 'I have ___.', answer: ' / ' })).toBe(false)
  })

  it('order: at least 3 words', () => {
    const order = { ...base, type: 'order' as const, prompt: 'Order' }
    expect(canPublish({ ...order, sentence: 'She has been' })).toBe(true)
    expect(canPublish({ ...order, sentence: 'She has' })).toBe(false)
  })
})

describe('switchType', () => {
  it('single keeps only the first correct option', () => {
    const v = choice({
      options: [
        { text: 'a', correct: true },
        { text: 'b', correct: true },
      ],
    })
    expect(switchType(v, 'single').options?.map((o) => o.correct)).toEqual([true, false])
    expect(switchType(v, 'multi')).toEqual({ type: 'multi' })
  })
})

describe('buildPayload', () => {
  it('choice: drops empty options, ids a, b, …', () => {
    expect(buildPayload(choice({}), null)).toEqual({
      content: {
        options: [
          { id: 'a', text: 'went' },
          { id: 'b', text: 'gone' },
        ],
      },
      answer_key: { correct: ['a'] },
    })
  })

  it('fill: before / after around ___, accepted split by /, optional hint', () => {
    const v = {
      ...base,
      type: 'fill' as const,
      prompt: 'F',
      sentence: 'I have never ___ sushi.',
      answer: 'eaten / Eaten',
      hint: '',
    }
    expect(buildPayload(v, null)).toEqual({
      content: { before: 'I have never', after: 'sushi.' },
      answer_key: { accepted: ['eaten', 'Eaten'] },
    })
  })

  it('order: tiles shuffled, key in sentence order', () => {
    const v = { ...base, type: 'order' as const, prompt: 'O', sentence: 'She has been' }
    const { content, answer_key } = buildPayload(v, null, fixed)
    expect(answer_key).toEqual({ order: ['t1', 't2', 't3'] })
    expect(content.tiles?.map((t) => t.text)).not.toEqual(['She', 'has', 'been'])
    expect(content.tiles?.map((t) => t.text).sort()).toEqual(['She', 'been', 'has'])
  })

  it('draft with an incomplete key sends no key', () => {
    expect(
      buildPayload(
        choice({
          options: [
            { text: 'a', correct: false },
            { text: 'b', correct: false },
          ],
        }),
        null,
      ).answer_key,
    ).toBeNull()
  })

  it('unchanged question sends the original JSON back', () => {
    const original = makeQuestion({
      id: 1,
      type: 'order',
      content: {
        tiles: [
          { id: 'x', text: 'been' },
          { id: 'y', text: 'She' },
          { id: 'z', text: 'has' },
        ],
      },
      answer_key: { order: ['y', 'z', 'x'] },
    })
    const v = { ...fromQuestion(original, null), prompt: 'Reworded' }
    expect(buildPayload(v, original)).toEqual({
      content: original.content,
      answer_key: original.answer_key,
    })

    const choiceQ = makeQuestion({
      id: 2,
      content: {
        options: [
          { id: 'q', text: 'went' },
          { id: 'r', text: 'gone' },
        ],
      },
      answer_key: { correct: ['q'] },
    })
    expect(buildPayload(fromQuestion(choiceQ, null), choiceQ).content).toBe(choiceQ.content)
  })
})

describe('fromQuestion', () => {
  it('maps fill and order back to the form', () => {
    const fill = makeQuestion({
      id: 3,
      type: 'fill',
      content: { before: 'The film had already', after: '.', hint: 'start' },
      answer_key: { accepted: ['started', 'begun'] },
    })
    expect(fromQuestion(fill, null)).toMatchObject({
      sentence: 'The film had already ___.',
      answer: 'started / begun',
      hint: 'start',
    })
    expect(buildPayload(fromQuestion(fill, null), null).content).toEqual(fill.content)
  })
})

describe('shuffleTiles', () => {
  it('never returns the original order for 2+ items', () => {
    const items = [{ n: 1 }, { n: 2 }]
    for (let i = 0; i < 20; i++) expect(shuffleTiles(items)).not.toEqual(items)
  })
})
