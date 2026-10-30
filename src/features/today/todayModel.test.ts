import { makeQuestion } from '@/test/fixtures'
import type { Explanation } from '@/services/today'
import { closesIn, correctRate, optionBars, pickLabel, reportLabel, timeAgo } from './todayModel'

const stats = { answers_count: 8, correct_count: 5, option_votes: { a: 5, b: 3 } }
const explanation = (over: Partial<Explanation>): Explanation => ({
  id: 1,
  user: { name: 'Anna', avatar_url: null },
  response: {},
  is_correct: true,
  explanation: 'x',
  likes_count: 0,
  reports_count: 0,
  replies_count: 0,
  reports: { count: 0, top_reason: null },
  reported_replies_count: 0,
  moderation_status: 'visible',
  created_at: '2026-10-29T10:00:00Z',
  ...over,
})

describe('today model', () => {
  it('closes at the next UTC midnight', () => {
    expect(closesIn(new Date('2026-10-29T14:48:30Z'))).toBe('9h 11m')
    expect(closesIn(new Date('2026-10-29T23:59:59Z'))).toBe('0h 0m')
  })

  it('correct rate', () => {
    expect(correctRate(stats)).toBe(63)
    expect(correctRate({ ...stats, answers_count: 0, correct_count: 0 })).toBeNull()
  })

  it('option bars', () => {
    expect(optionBars(makeQuestion({ id: 1 }), stats)).toEqual([
      { id: 'a', letter: 'A', text: 'went', count: 5, pct: 63, correct: true },
      { id: 'b', letter: 'B', text: 'gone', count: 3, pct: 38, correct: false },
    ])
  })

  it('pick labels per type', () => {
    expect(
      pickLabel(explanation({ response: { option_ids: ['b'] } }), makeQuestion({ id: 1 })),
    ).toBe('Picked B')
    expect(
      pickLabel(explanation({ response: { text: 'gone' } }), makeQuestion({ id: 2, type: 'fill' })),
    ).toBe('Typed "gone"')
    expect(
      pickLabel(explanation({ is_correct: false }), makeQuestion({ id: 3, type: 'order' })),
    ).toBe('Wrong order')
  })

  it('time ago', () => {
    expect(timeAgo('2026-10-29T10:00:00Z', new Date('2026-10-29T10:05:00Z'))).toBe('5 minutes ago')
  })
})

describe('reportLabel', () => {
  it('count and top reason', () => {
    expect(reportLabel({ count: 3, top_reason: 'spam' })).toBe(
      'Reported 3 times · Spam or advertising',
    )
    expect(reportLabel({ count: 1, top_reason: null })).toBe('Reported 1 time')
  })
})
