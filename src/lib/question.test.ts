import type { Question } from '@/services/questions'
import { displayText, orderedWords, sentenceOf } from './question'

const base = { prompt: 'P', answer_key: null } as Pick<Question, 'prompt' | 'answer_key'>

describe('sentenceOf', () => {
  it('fill: blank between before and after, no space before punctuation', () => {
    expect(
      sentenceOf({
        ...base,
        type: 'fill',
        content: { before: 'The film had already', after: '.' },
      }),
    ).toBe('The film had already ___.')
  })

  it('order: tiles in key order', () => {
    const q = {
      ...base,
      type: 'order' as const,
      content: {
        tiles: [
          { id: 't1', text: 'been' },
          { id: 't2', text: 'She' },
          { id: 't3', text: 'has' },
        ],
      },
      answer_key: { order: ['t2', 't3', 't1'] },
    }
    expect(orderedWords(q)).toEqual(['She', 'has', 'been'])
    expect(sentenceOf(q)).toBe('She has been')
  })

  it('choice questions have no sentence', () => {
    const q = { ...base, type: 'single' as const, content: {} } as Question
    expect(sentenceOf(q)).toBeNull()
    expect(displayText(q)).toBe('P')
  })
})
