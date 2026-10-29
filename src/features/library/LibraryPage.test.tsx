import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import type { Question } from '@/services/questions'
import { LibraryPage } from './LibraryPage'

const questions: Question[] = [
  {
    id: 2,
    type: 'order',
    prompt: 'Put the words in order.',
    content: {
      tiles: [
        { id: 't1', text: 'been' },
        { id: 't2', text: 'She' },
        { id: 't3', text: 'has' },
      ],
    },
    answer_key: { order: ['t2', 't3', 't1'] },
    status: 'scheduled',
    date: '2026-11-01',
    author: { id: 'u', name: 'Tuan Nguyen', role: 'user' },
    explanation: null,
    author_name: null,
    has_answers: false,
    usage_count: 1,
    created_at: '',
    updated_at: '',
  },
  {
    id: 1,
    type: 'single',
    prompt: 'Past of "go"?',
    content: {
      options: [
        { id: 'a', text: 'went' },
        { id: 'b', text: 'gone' },
      ],
    },
    answer_key: { correct: ['a'] },
    status: 'published',
    date: '2026-10-01',
    author: { id: 'a', name: 'Linh Tran', role: 'admin' },
    explanation: null,
    author_name: null,
    has_answers: false,
    usage_count: 3,
    created_at: '',
    updated_at: '',
  },
]

vi.mock('@/services/questions', () => ({
  useQuestions: () => ({ data: questions, isPending: false, isError: false }),
  useQuestionHistory: () => ({
    data: [
      { date: '2026-10-01', question_id: 1, status: 'shown' },
      { date: '2025-03-12', question_id: 9, status: 'shown' },
    ],
    isPending: false,
    isError: false,
  }),
}))

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/library']}>
      <LibraryPage />
    </MemoryRouter>,
  )

describe('LibraryPage', () => {
  it('lists questions with badges and actions', () => {
    renderPage()
    expect(screen.getByText('2 questions')).toBeInTheDocument()
    expect(screen.getByText('Put the words in order. — She has been')).toBeInTheDocument()
    expect(screen.getByText('User submitted')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reuse/ })).toBeEnabled()
  })

  it('searches and filters', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/Search by word/), 'went')
    expect(screen.queryByText(/Put the words/)).not.toBeInTheDocument()
    await user.clear(screen.getByPlaceholderText(/Search by word/))

    await user.click(screen.getByRole('button', { name: /Added by/ }))
    await user.click(screen.getByRole('button', { name: /Users/ }))
    expect(screen.queryByText('Past of "go"?')).not.toBeInTheDocument()
    expect(screen.getByText(/Put the words/)).toBeInTheDocument()
  })

  it('opens View, then History', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getAllByRole('button', { name: /View/ })[1])
    const view = screen.getByRole('dialog')
    expect(within(view).getByText('Correct')).toBeInTheDocument()

    await user.click(within(view).getByRole('button', { name: 'History · 3' }))
    const history = screen.getByRole('dialog')
    expect(within(history).getByText('Shown 2 times · first used Mar 2025')).toBeInTheDocument()
    expect(within(history).getByText('Thu, Oct 1')).toBeInTheDocument()
  })
})
