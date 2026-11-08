import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { plusDays, todayUTC } from '@/lib/dates'
import { weekStartOf } from '@/lib/weeks'
import { makeQuestion } from '@/test/fixtures'
import { DailyQuestionsTab } from './DailyQuestionsTab'

// Next week: every day is in the future.
const weekStart = plusDays(weekStartOf(todayUTC()), 7)
const questions = [
  makeQuestion({ id: 7, prompt: 'Past of "go"?', status: 'scheduled', date: weekStart }),
]
const mutateAsync = vi.fn()

vi.mock('@/services/questions', () => ({
  useQuestions: () => ({ data: questions, isPending: false, isError: false }),
  useSaveQuestion: () => ({ mutateAsync, isPending: false }),
  useScheduleQuestion: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useQuestionSearch: () => ({ data: undefined }),
}))
vi.mock('@/services/lessons', () => ({
  useSetQuestionCard: () => ({ mutate: vi.fn(), isPending: false }),
}))
vi.mock('@/auth/useAuth', () => ({ useAuth: () => ({ me: { name: 'Linh Tran' } }) }))

const renderTab = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <DailyQuestionsTab weekStart={weekStart} lesson={null} readOnly={false} />
      </MemoryRouter>
    </QueryClientProvider>,
  )

beforeEach(() => mutateAsync.mockReset())

describe('DailyQuestionsTab', () => {
  it('lists the 7 days and shows Monday’s question', () => {
    renderTab()
    expect(screen.getAllByText('Past of "go"?')).toHaveLength(3) // list + panel + phone preview
    expect(screen.getByText('App preview · after answering')).toBeInTheDocument()
    expect(screen.getAllByText('No question')).toHaveLength(6)
    expect(screen.getByRole('button', { name: 'Remove question' })).toBeInTheDocument()
  })

  it('empty day: no phone preview', async () => {
    const user = userEvent.setup()
    renderTab()
    await user.click(screen.getAllByText('No question')[0])
    expect(screen.queryByText('App preview · after answering')).not.toBeInTheDocument()
  })

  it('empty day: write or choose from library', async () => {
    const user = userEvent.setup()
    renderTab()
    await user.click(screen.getAllByText('No question')[0])
    expect(screen.getByText(/No question for Tuesday/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Write question/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Choose from library/ })).toBeInTheDocument()
  })

  it('removing sends the question back to the library', async () => {
    const user = userEvent.setup()
    renderTab()
    await user.click(screen.getByRole('button', { name: 'Remove question' }))
    expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ id: 7, date: null }))
  })
})
