import { describe, expect, it } from 'vitest'
import { contentLabel, relativeWeek, weekAction, weekRange, weekStartOf } from './weeks'

describe('weeks', () => {
  it('weekStartOf → Monday', () => {
    expect(weekStartOf('2026-11-08')).toBe('2026-11-02') // Sunday
    expect(weekStartOf('2026-11-02')).toBe('2026-11-02') // Monday
    expect(weekStartOf('2026-11-04')).toBe('2026-11-02')
  })

  it('weekRange', () => {
    expect(weekRange('2026-11-02')).toBe('Nov 2 – 8')
    expect(weekRange('2026-10-26')).toBe('Oct 26 – Nov 1')
  })

  it('relativeWeek', () => {
    const cur = '2026-11-02'
    expect(relativeWeek('2026-11-02', cur)).toBe('This week')
    expect(relativeWeek('2026-11-09', cur)).toBe('Next week')
    expect(relativeWeek('2026-10-26', cur)).toBe('Last week')
    expect(relativeWeek('2026-10-19', cur)).toBe('2 weeks ago')
    expect(relativeWeek('2026-11-23', cur)).toBe('In 3 weeks')
  })

  it('actions and content', () => {
    expect(weekAction('empty')).toBe('Plan week')
    expect(weekAction('ended')).toBe('View')
    expect(weekAction('draft')).toBe('Edit')
    expect(contentLabel('grammar', 7)).toBe('7 cards')
    expect(contentLabel('vocab', 1)).toBe('1 word')
  })
})
