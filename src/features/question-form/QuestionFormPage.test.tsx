import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { nextDays, todayUTC } from '@/lib/dates'
import { makeQuestion } from '@/test/fixtures'
import { QuestionFormPage } from './QuestionFormPage'

const [tomorrow, dayAfter] = nextDays(todayUTC(), 2)
const questions = [
  makeQuestion({ id: 1, prompt: 'Taken tomorrow', status: 'scheduled', date: tomorrow }),
  makeQuestion({
    id: 2,
    prompt: 'Live one',
    status: 'live',
    date: todayUTC(),
    has_answers: true,
    content: {
      options: [
        { id: 'q', text: 'went' },
        { id: 'r', text: 'gone' },
      ],
    },
    answer_key: { correct: ['q'] },
  }),
]
const mutateAsync = vi.fn()
const resolveSaved = () =>
  mutateAsync.mockImplementation(async (input: { date: string | null }) => ({
    ...questions[0],
    date: input.date,
  }))

vi.mock('@/services/questions', () => ({
  useQuestions: () => ({ data: questions, isPending: false, isError: false }),
  useSaveQuestion: () => ({ mutateAsync, isPending: false }),
}))
vi.mock('@/auth/useAuth', () => ({ useAuth: () => ({ me: { name: 'Linh Tran' } }) }))

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/questions/new" element={<QuestionFormPage />} />
        <Route path="/questions/:id/edit" element={<QuestionFormPage />} />
        <Route path="/library" element={<div>library</div>} />
      </Routes>
    </MemoryRouter>,
  )

beforeEach(() => {
  mutateAsync.mockReset()
  resolveSaved()
})

describe('QuestionFormPage', () => {
  it('creates a single-choice question on the first empty day', async () => {
    const user = userEvent.setup()
    renderAt('/questions/new')
    expect(screen.getByRole('heading', { name: 'New question' })).toBeInTheDocument()

    const schedule = screen.getByRole('button', { name: 'Schedule' })
    expect(schedule).toBeDisabled()

    await user.type(screen.getByPlaceholderText(/past simple of "catch"/), 'Past of "catch"?')
    const [a, b] = screen.getAllByPlaceholderText('Option text')
    await user.type(a, 'caught')
    await user.type(b, 'catched')
    await user.click(screen.getAllByTitle('Mark as correct')[0])
    expect(schedule).toBeEnabled()

    await user.click(schedule)
    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        id: null,
        type: 'single',
        prompt: 'Past of "catch"?',
        content: {
          options: [
            { id: 'a', text: 'caught' },
            { id: 'b', text: 'catched' },
          ],
        },
        answer_key: { correct: ['a'] },
        author_name: 'Linh Tran',
        date: dayAfter, // tomorrow is taken
        publish: true,
      }),
    )
    expect(await screen.findByText('library')).toBeInTheDocument()
  })

  it('warns when the picked day is taken', async () => {
    const user = userEvent.setup()
    renderAt(`/questions/new?date=${dayAfter}`)
    expect(screen.queryByText(/scheduling will replace it/)).not.toBeInTheDocument()
    await user.click(screen.getByTitle('Taken tomorrow'))
    expect(screen.getByText(/scheduling will replace it/)).toBeInTheDocument()
  })

  it('answered live question: answers locked, original JSON sent back', async () => {
    const user = userEvent.setup()
    renderAt('/questions/2/edit')
    expect(screen.getByRole('heading', { name: "Edit today's question" })).toBeInTheDocument()
    expect(screen.getByText(/Users already answered/)).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText('Option text')[0]).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Save draft' })).not.toBeInTheDocument()

    await user.type(
      screen.getByPlaceholderText('Why is this the correct answer?'),
      'go – went – gone',
    )
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 2,
        content: questions[1].content,
        answer_key: questions[1].answer_key,
        explanation: 'go – went – gone',
        date: todayUTC(),
      }),
    )
  })
})
