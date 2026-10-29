import { makeQuestion } from '@/test/fixtures'
import {
  buildDays,
  countDays,
  coverageColor,
  emptyDays,
  monthDates,
  monthLabel,
  questionsByDate,
} from './scheduleModel'

const today = '2026-10-29'
const questions = [
  makeQuestion({ id: 1, date: '2026-10-28', status: 'published' }),
  makeQuestion({ id: 2, date: today, status: 'live' }),
  makeQuestion({ id: 3, date: '2026-10-30', status: 'scheduled' }),
  makeQuestion({ id: 4, date: '2026-10-31', status: 'draft' }),
  makeQuestion({ id: 5, date: null, status: 'unscheduled' }),
]
const byDate = questionsByDate(questions)

describe('schedule model', () => {
  it('months', () => {
    expect(monthDates(today, 0)).toHaveLength(31)
    expect(monthDates(today, 0)[0]).toBe('2026-10-01')
    expect(monthDates(today, 1)).toHaveLength(30)
    expect(monthDates(today, 4)[27]).toBe('2027-02-28')
    expect(monthLabel(today, -1)).toBe('Sep 2026')
  })

  it('days, legend and coverage', () => {
    const days = buildDays(
      ['2026-10-27', '2026-10-28', today, '2026-10-30', '2026-10-31', '2026-11-01'],
      today,
      byDate,
    )
    expect(days.map((d) => [d.kind, d.question?.id ?? null])).toEqual([
      ['past', null],
      ['past', 1],
      ['live', 2],
      ['future', 3],
      ['future', 4],
      ['future', null],
    ])
    expect(countDays(days)).toEqual({ scheduled: 1, draft: 1, empty: 1 })
    expect(days.map(coverageColor)).toEqual([
      'var(--color-page)',
      'var(--color-disabled)',
      'var(--color-ink)',
      'var(--color-brand)',
      'var(--color-brand-light)',
      'var(--color-line-strong)',
    ])
  })

  it('empty days in the next 14', () => {
    const empty = emptyDays(questions, today)
    expect(empty).toHaveLength(12)
    expect(empty[0]).toBe('2026-11-01')
  })
})
