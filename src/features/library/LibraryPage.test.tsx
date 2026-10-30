import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import type { SearchParams } from '@/services/questions'
import { makeQuestion } from '@/test/fixtures'
import { LibraryPage } from './LibraryPage'

const questions = [
  makeQuestion({
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
  }),
  makeQuestion({ id: 1, prompt: 'Past of "go"?', status: 'published', usage_count: 3 }),
]

// Filtering and paging happen on the server: the page passes params + page number.
const requests = vi.fn((params: SearchParams, page: number) => [params, page])
let total = 42

vi.mock('@/services/questions', () => ({
  LIBRARY_PAGE_SIZE: 8,
  useQuestionPage: (params: SearchParams, page: number) => {
    requests(params, page)
    return {
      data: {
        items: questions,
        next_cursor: null,
        total,
        counts: {
          status: { all: 42, published: 3, unpublished: 4, upcoming: 2, draft: 1 },
          sources: { all: 50, admin: 6, user: 3 },
        },
      },
      isPending: false,
      isError: false,
      isSuccess: true,
      isPlaceholderData: false,
    }
  },
  useQuestionHistory: () => ({
    data: [
      { date: '2026-10-01', question_id: 1, status: 'shown' },
      { date: '2025-03-12', question_id: 9, status: 'shown' },
    ],
    isPending: false,
    isError: false,
  }),
}))

const renderPage = (path = '/library') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <LibraryPage />
    </MemoryRouter>,
  )
const lastPage = () => requests.mock.lastCall?.[1]

beforeEach(() => {
  requests.mockClear()
  total = 42
})

describe('LibraryPage', () => {
  it('lists the page with badges, actions and server counts', () => {
    renderPage()
    expect(screen.getByText('50 questions')).toBeInTheDocument()
    expect(screen.getByText('Put the words in order. — She has been')).toBeInTheDocument()
    expect(screen.getByText('User submitted')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reuse/ })).toBeEnabled()
  })

  it('numbered pagination: range, pages with gaps, prev / next', async () => {
    const user = userEvent.setup()
    renderPage('/library?page=3')
    const nav = screen.getByRole('navigation', { name: 'Pagination' })
    expect(within(nav).getByText('Showing 17–24 of 42')).toBeInTheDocument()
    // 6 pages: 1 2 [3] 4 … 6
    expect(
      within(nav)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['', '1', '2', '3', '4', '6', ''])
    expect(within(nav).getByText('…')).toBeInTheDocument()
    expect(within(nav).getByRole('button', { name: '3' })).toHaveAttribute('aria-current', 'page')

    await user.click(within(nav).getByRole('button', { name: '6' }))
    expect(lastPage()).toBe(6)
    await user.click(within(nav).getByRole('button', { name: 'Previous page' }))
    expect(lastPage()).toBe(5)
  })

  it('changing a filter or the search goes back to page 1', async () => {
    const user = userEvent.setup()
    renderPage('/library?page=4&type=fill')
    expect(requests).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'fill' }), 4)

    await user.click(screen.getByRole('button', { name: /Added by/ }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Users/ }))
    expect(requests).toHaveBeenLastCalledWith(
      expect.objectContaining({ source: 'user', type: 'fill' }),
      1,
    )

    await user.click(screen.getByRole('button', { name: '2' }))
    await user.type(screen.getByPlaceholderText(/Search by word/), 'went')
    await waitFor(() =>
      expect(requests).toHaveBeenLastCalledWith(expect.objectContaining({ query: 'went' }), 1),
    )
    // Debounced: no request per key press.
    expect(requests).not.toHaveBeenCalledWith(expect.objectContaining({ query: 'w' }), 1)
  })

  it('clamps the page when results shrink, hides the pager when empty', async () => {
    total = 10
    const { unmount } = renderPage('/library?page=5')
    await waitFor(() => expect(lastPage()).toBe(2))
    unmount()

    total = 0
    renderPage()
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument()
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
