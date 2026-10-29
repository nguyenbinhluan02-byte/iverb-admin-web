import type { QuestionUse } from '@/services/questions'
import { groupByYear, historySummary } from './history'

const use = (date: string, status: QuestionUse['status']): QuestionUse => ({
  date,
  question_id: 1,
  status,
})

describe('history', () => {
  const uses = [
    use('2026-11-02', 'scheduled'),
    use('2026-10-29', 'live'),
    use('2025-03-01', 'shown'),
    use('2024-03-12', 'shown'),
  ]

  it('summarises shown days and the first use', () => {
    expect(historySummary(uses)).toBe('Shown 3 times · first used Mar 2024')
    expect(historySummary([use('2026-11-02', 'draft')])).toBe('Shown 0 times · first used Nov 2026')
    expect(historySummary([])).toBe('Shown 0 times')
  })

  it('groups by year, newest first', () => {
    expect(groupByYear(uses).map(([y, items]) => [y, items.length])).toEqual([
      ['2026', 2],
      ['2025', 1],
      ['2024', 1],
    ])
  })
})
