import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { todayUTC } from '@/lib/dates'
import { makeQuestion } from '@/test/fixtures'
import type { Explanation, Reply, Today } from '@/services/today'
import { TodayPage } from './TodayPage'

const question = makeQuestion({
  id: 7,
  prompt: 'Past of "go"?',
  status: 'live',
  date: todayUTC(),
  explanation: 'go – went – gone',
})
let today: Today
let explanation: Explanation
let reply: Reply
const remove = vi.fn(async () => {})
const deleteReply = vi.fn(async () => {})
const dismiss = vi.fn(async () => {})
const repliesEnabled = vi.fn()
const explanationsFilter = vi.fn()

vi.mock('@/services/today', () => ({
  useToday: () => ({ data: today, isPending: false, isError: false }),
  useExplanations: (questionId: number, filter: string) => {
    explanationsFilter(questionId, filter)
    return {
      hasNextPage: false,
      data: { pages: [{ next_cursor: null, items: [explanation] }] },
      isPending: false,
      isError: false,
    }
  },
  useRemoveExplanation: () => ({ mutateAsync: remove, isPending: false }),
  useReplies: (answerId: number, enabled: boolean) => {
    repliesEnabled(answerId, enabled)
    return {
      hasNextPage: true,
      isFetchingNextPage: false,
      data: {
        pages: [
          {
            next_cursor: { id: 21 },
            items: [reply],
          },
        ],
      },
      isPending: false,
      isError: false,
    }
  },
  useDeleteReply: () => ({ mutateAsync: deleteReply, isPending: false }),
  useDismissReports: () => ({ mutateAsync: dismiss, isPending: false }),
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
  deleteReply.mockClear()
  dismiss.mockClear()
  repliesEnabled.mockClear()
  explanationsFilter.mockClear()
  explanation = {
    id: 11,
    user: { name: 'Bao Le', avatar_url: null },
    response: { option_ids: ['b'] },
    is_correct: false,
    explanation: 'I thought gone.',
    likes_count: 4,
    reports_count: 0,
    replies_count: 2,
    reports: { count: 0, top_reason: null },
    reported_replies_count: 0,
    moderation_status: 'visible',
    created_at: new Date().toISOString(),
  }
  reply = {
    id: 21,
    user: { name: 'Chi Vo', avatar_url: null },
    text: 'Same here, went is the past.',
    moderation_status: 'visible',
    reports: { count: 0, top_reason: null },
    created_at: new Date().toISOString(),
  }
  today = {
    date: todayUTC(),
    question,
    stats: { answers_count: 1284, correct_count: 796, option_votes: { a: 796, b: 488 } },
    explanations_count: 1,
    reported_count: 3,
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

  it('shows replies on demand and deletes one after confirming', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(screen.queryByText('Same here, went is the past.')).not.toBeInTheDocument()
    expect(repliesEnabled).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'View 2 replies' }))
    expect(repliesEnabled).toHaveBeenCalledWith(11, true)
    expect(screen.getByText('Same here, went is the past.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Load more replies (1 left)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide replies' })).toBeInTheDocument()

    const reply = screen.getByText('Same here, went is the past.').parentElement!
    await user.click(within(reply).getByRole('button', { name: 'Delete' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Delete this reply?')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(deleteReply).toHaveBeenCalledWith({ replyId: 21, answerId: 11 })
    expect(remove).not.toHaveBeenCalled()
  })

  it('switches to the reported filter', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(explanationsFilter).toHaveBeenLastCalledWith(7, 'all')
    expect(screen.getByRole('button', { name: 'All · 1' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Reported · 3' }))
    expect(explanationsFilter).toHaveBeenLastCalledWith(7, 'reported')
    expect(screen.getByRole('button', { name: 'Reported · 3' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('shows a reported explanation and dismisses its reports', async () => {
    explanation = {
      ...explanation,
      reports: { count: 3, top_reason: 'misleading' },
      reported_replies_count: 1,
      moderation_status: 'hidden',
    }
    const user = userEvent.setup()
    renderPage()
    const box = screen.getByText('Reported 3 times · Wrong or misleading answer').parentElement!
    expect(screen.getByText('Hidden')).toBeInTheDocument()
    expect(screen.getByText('1 reported reply')).toBeInTheDocument()

    await user.click(within(box).getByRole('button', { name: 'Dismiss' }))
    expect(dismiss).toHaveBeenCalledWith({ type: 'answer', id: 11 })

    await user.click(within(box).getByRole('button', { name: 'Delete' }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(remove).toHaveBeenCalledWith(11)
  })

  it('shows a reported reply and dismisses its reports', async () => {
    reply = { ...reply, reports: { count: 1, top_reason: 'harassment' } }
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'View 2 replies' }))
    const box = screen.getByText('Reported 1 time · Harassment or bullying').parentElement!
    await user.click(within(box).getByRole('button', { name: 'Dismiss' }))
    expect(dismiss).toHaveBeenCalledWith({ type: 'reply', id: 21 })
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
  })

  it('no question today', () => {
    today = { ...today, question: null }
    renderPage()
    expect(screen.getByText(/No question is live today/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit question' })).not.toBeInTheDocument()
  })
})
