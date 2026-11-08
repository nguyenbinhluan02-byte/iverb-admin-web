import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { plusDays, todayUTC } from '@/lib/dates'
import { weekStartOf } from '@/lib/weeks'
import type { LessonSummary, WeekRow } from '@/services/weeks'
import { MoveWeekDialog } from './MoveWeekDialog'

const next = plusDays(weekStartOf(todayUTC()), 7)
const lesson = (title: string) => ({ id: 1, type: 'grammar', title, cards_count: 3 }) as LessonSummary
const row = (week_start: string, status: WeekRow['status'], l: LessonSummary | null): WeekRow => ({
  week_start,
  week_status: 'upcoming',
  status,
  lesson: l,
  questions_count: 0,
  question_days: Array(7).fill(false),
})
const weeks = [
  row(next, 'draft', lesson('Source')),
  row(plusDays(next, 7), 'scheduled', lesson('Other lesson')),
  row(plusDays(next, 14), 'empty', null),
]
const mutateAsync = vi.fn(async () => ({ swapped: false }))

vi.mock('@/services/weeks', () => ({
  useWeeksNeedingWork: () => ({ data: { count: 1, next_week_start: next, last_planned_week_start: plusDays(next, 7) } }),
  useLessonWeeks: () => ({ data: weeks }),
  useMoveWeek: () => ({ mutateAsync, isPending: false }),
}))

describe('MoveWeekDialog', () => {
  it('lists the other upcoming weeks; empty target → Move, planned → Swap', async () => {
    const user = userEvent.setup()
    const onMoved = vi.fn()
    render(<MoveWeekDialog weekStart={next} lesson={lesson('Source')} onClose={() => {}} onMoved={onMoved} />)

    expect(screen.getByRole('button', { name: 'Choose a week' })).toBeDisabled()
    expect(screen.queryByText('Grammar · Source')).toBeInTheDocument() // only in the sub-title
    await user.click(screen.getByText('Grammar · Other lesson'))
    expect(screen.getByText(/The two weeks will swap/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Swap weeks' })).toBeEnabled()

    await user.click(screen.getByText('No lesson yet'))
    await user.click(screen.getByRole('button', { name: 'Move lesson' }))
    expect(mutateAsync).toHaveBeenCalledWith({ from: next, to: plusDays(next, 14) })
    expect(onMoved).toHaveBeenCalledWith(plusDays(next, 14))
  })
})
