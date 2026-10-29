import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { todayUTC } from '@/lib/dates'
import { makeQuestion } from '@/test/fixtures'
import type { Today } from '@/services/today'
import { TodayPage } from './TodayPage'

const question = makeQuestion({
  id: 7,
  prompt: 'Past of "go"?',
  status: 'live',
  date: todayUTC(),
  explanation: 'go – went – gone',
})
let today: Today
const remove = vi.fn(async () => {})

vi.mock('@/services/today', () => ({
  useToday: () => ({ data: today, isPending: false, isError: false }),
  useExplanations: () => ({
    hasNextPage: false,
    data: {
      pages: [
        {
          next_cursor: null,
          items: [
            {
              id: 11,
              user: { name: 'Bao Le', avatar_url: null },
              response: { option_ids: ['b'] },
              is_correct: false,
              explanation: 'I thought gone.',
              likes_count: 4,
              reports_count: 0,
              moderation_status: 'visible',
              created_at: new Date().toISOString(),
            },
          ],
        },
      ],
    },
    isPending: false,
    isError: false,
  }),
  useRemoveExplanation: () => ({ mutateAsync: remove, isPending: false }),
}))
vi.mock('@/services/questions', () => ({
  useQuestions: () => ({ data: [question], isPending: false }),
}))

const renderPage = () =>
  render(
    <MemoryRouter>
      <TodayPage />
    </MemoryRouter>,
  )

beforeEach(() => {
  remove.mockClear()
  today = {
    date: todayUTC(),
    question,
    stats: { answers_count: 1284, correct_count: 796, option_votes: { a: 796, b: 488 } },
    explanations_count: 1,
  }
})

describe('TodayPage', () => {
  it('shows answers, correct rate and option bars', () => {
    renderPage()
    expect(screen.getByText('1,284')).toBeInTheDocument()
    expect(screen.getByText('Correct rate').parentElement).toHaveTextContent('62%')
    expect(screen.getByText('796 picked the right answer')).toBeInTheDocument()
    expect(screen.getByText('488')).toBeInTheDocument()
    expect(screen.getByText('go – went – gone')).toBeInTheDocument()
    expect(screen.queryByText(/7-day/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Reply/ })).not.toBeInTheDocument()
  })

  it('deletes an explanation after confirming', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(screen.getByText('Picked B')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Delete/ }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(remove).toHaveBeenCalledWith(11)
  })

  it('no question today', () => {
    today = { ...today, question: null }
    renderPage()
    expect(screen.getByText(/No question is live today/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit question' })).not.toBeInTheDocument()
  })
})
