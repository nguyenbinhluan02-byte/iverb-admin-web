import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { nextDays, plusDays, todayUTC } from '@/lib/dates'
import { makeQuestion } from '@/test/fixtures'
import { SchedulePage } from './SchedulePage'

const today = todayUTC()
const [tomorrow, day2] = nextDays(today, 2)
const questions = [
  makeQuestion({ id: 1, prompt: 'Shown before', status: 'published', date: plusDays(today, -40) }),
  makeQuestion({ id: 2, prompt: 'Live now', status: 'live', date: today }),
  makeQuestion({ id: 3, prompt: 'Tomorrow question', status: 'scheduled', date: tomorrow }),
  makeQuestion({ id: 4, prompt: 'Loose draft', status: 'draft', date: null }),
]
const mutateAsync = vi.fn()

const search = vi.fn()

vi.mock('@/services/questions', () => ({
  useQuestions: () => ({ data: questions, isPending: false, isError: false }),
  // The picker asks the server for pickable questions (shown first).
  useQuestionSearch: (params: unknown) => {
    search(params)
    return {
      data: {
        pages: [
          {
            items: [questions[0], questions[3]],
            next_cursor: null,
            total: 2,
            counts: {
              status: { all: 2, published: 1, unpublished: 1, upcoming: 0, draft: 1 },
              sources: { all: 2, admin: 2, user: 0 },
            },
          },
        ],
      },
      isPending: false,
      isError: false,
      isSuccess: true,
      hasNextPage: false,
    }
  },
  useScheduleQuestion: () => ({ mutateAsync, isPending: false }),
  useQuestionHistory: () => ({ data: [], isPending: false, isError: false }),
}))

const renderPage = (path = '/schedule') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <SchedulePage />
    </MemoryRouter>,
  )

beforeEach(() => {
  mutateAsync.mockReset()
  mutateAsync.mockImplementation(async ({ date }: { date: string }) => ({
    ...questions[3],
    status: 'scheduled',
    date,
  }))
})

describe('SchedulePage', () => {
  it('lists the next 14 days with legend counts', () => {
    renderPage()
    expect(screen.getAllByTestId(/^day-/)).toHaveLength(14)
    expect(
      within(screen.getByTestId(`day-${tomorrow}`)).getByText('Tomorrow question'),
    ).toBeInTheDocument()
    expect(
      within(screen.getByTestId(`day-${tomorrow}`)).getByRole('button', { name: 'Edit' }),
    ).toBeInTheDocument()
    expect(
      within(screen.getByTestId(`day-${day2}`)).getByText(/users will see an empty day/),
    ).toBeInTheDocument()
    expect(screen.getByText('13').parentElement).toHaveTextContent('13 empty')
  })

  it('schedules a library question on an empty day', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(
      within(screen.getByTestId(`day-${day2}`)).getByRole('button', { name: /From library/ }),
    )

    const dialog = screen.getByRole('dialog')
    expect(search).toHaveBeenLastCalledWith(
      expect.objectContaining({ pickable: true, sort: 'oldest', status: 'all' }),
    )
    expect(within(dialog).getByText('2 questions')).toBeInTheDocument()
    expect(
      within(dialog)
        .getAllByRole('radio')
        .map((r) => r.textContent),
    ).toEqual([expect.stringContaining('Shown before'), expect.stringContaining('Loose draft')])
    // Filters open above the modal and keep it open.
    await user.click(within(dialog).getByRole('button', { name: /Status/ }))
    await user.click(screen.getByRole('button', { name: /^Published/ }))
    expect(search).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'published' }))
    expect(screen.getByRole('heading', { name: 'Choose from library' })).toBeInTheDocument()

    const schedule = within(dialog).getByRole('button', { name: 'Schedule' })
    expect(schedule).toBeDisabled()

    await user.click(within(dialog).getByRole('radio', { name: /Loose draft/ }))
    await user.click(schedule)
    expect(mutateAsync).toHaveBeenCalledWith({ id: 4, date: day2 })
  })

  it('month view shows past days read-only', () => {
    renderPage('/schedule?view=month')
    const rows = screen.getAllByTestId(/^day-/)
    expect(rows.length).toBeGreaterThanOrEqual(28)
    const live = screen.getByTestId(`day-${today}`)
    expect(within(live).getByText('Live today')).toBeInTheDocument()
    if (today.slice(8) !== '01') {
      const past = screen.getByTestId(`day-${plusDays(today, -1)}`)
      expect(within(past).getByText('No question was shown this day.')).toBeInTheDocument()
      expect(within(past).queryByRole('button')).not.toBeInTheDocument()
    }
  })
})
