import { makeQuestion } from '@/test/fixtures'
import { emptyForm } from './formModel'
import { findSimilar, similarity, tokens } from './similar'

describe('similarity', () => {
  it('ignores stop words, punctuation and 1-letter words', () => {
    expect([...tokens(['What is the past simple of "swim"?'])]).toEqual(['swim'])
  })

  it('needs at least 2 tokens on both sides', () => {
    expect(similarity(new Set(['swim']), new Set(['swim']))).toBe(0)
    expect(similarity(new Set(['swim', 'swam']), new Set(['swim', 'swam', 'swum']))).toBe(1)
  })
})

describe('findSimilar', () => {
  const questions = [
    makeQuestion({
      id: 1,
      prompt: 'Past of "swim"?',
      content: {
        options: [
          { id: 'a', text: 'swam' },
          { id: 'b', text: 'swum' },
        ],
      },
      status: 'published',
      date: '2026-10-12',
    }),
    makeQuestion({
      id: 2,
      prompt: 'Past of "catch"?',
      content: {
        options: [
          { id: 'a', text: 'caught' },
          { id: 'b', text: 'catched' },
        ],
      },
    }),
  ]
  const form = {
    ...emptyForm(null, 'A'),
    prompt: 'What is the past of swim?',
    options: [
      { text: 'swam', correct: true },
      { text: 'swimmed', correct: false },
    ],
  }

  it('lists matches ≥ 60% with when / type', () => {
    expect(findSimilar(form, questions, [])).toEqual([
      expect.objectContaining({ pct: 67, when: 'Shown Mon, Oct 12', typeLabel: 'Single choice' }),
    ])
  })

  it('skips excluded ids (the question being edited)', () => {
    expect(findSimilar(form, questions, [1])).toEqual([])
  })
})
