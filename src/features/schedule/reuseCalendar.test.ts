import { makeQuestion } from '@/test/fixtures'
import { calendarMonth } from './reuseCalendar'
import { questionsByDate } from './scheduleModel'

describe('calendarMonth', () => {
  const byDate = questionsByDate([
    makeQuestion({ id: 1, date: '2026-10-30', status: 'scheduled' }),
    makeQuestion({ id: 2, date: '2026-10-31', status: 'draft' }),
  ])

  it('Mon-first lead and cell states', () => {
    const m = calendarMonth('2026-10-29', 0, byDate)
    expect(m.label).toBe('Oct 2026')
    expect(m.lead).toBe(3) // Oct 1, 2026 is a Thursday
    expect(m.cells.slice(27).map((c) => c.state)).toEqual(['past', 'today', 'scheduled', 'draft'])
    expect(calendarMonth('2026-10-29', 1, byDate).cells[0].state).toBe('empty')
  })
})
