import { makeQuestion } from '@/test/fixtures'
import { pickWhen } from './pickModel'

describe('pickWhen', () => {
  it('labels shown, drafts and unscheduled questions', () => {
    expect(pickWhen(makeQuestion({ id: 1, status: 'published', date: '2026-10-12' }))).toBe(
      'Shown Mon, Oct 12',
    )
    expect(pickWhen(makeQuestion({ id: 2, status: 'draft', date: '2026-11-06' }))).toBe(
      'Draft · on Fri, Nov 6 (will move)',
    )
    expect(pickWhen(makeQuestion({ id: 3, status: 'draft', date: null }))).toBe('Draft')
    expect(pickWhen(makeQuestion({ id: 4, status: 'unscheduled', date: null }))).toBe(
      'Not scheduled',
    )
  })
})
