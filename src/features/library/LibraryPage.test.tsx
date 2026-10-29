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

// Filtering happens on the server: the page only passes params and shows pages.
const search = vi.fn((params: SearchParams) => params)
const fetchNextPage = vi.fn()
let hasNextPage = false

vi.mock('@/services/questions', () => ({
  useQuestionSearch: (params: SearchParams) => {
    search(params)
    return {
      data: {
        pages: [
          {
            items: questions,
            next_cursor: null,
            total: 7,
            counts: {
              status: { all: 7, published: 3, unpublished: 4, upcoming: 2, draft: 1 },
              sources: { all: 9, admin: 6, user: 3 },
            },
          },
        ],
      },
      isPending: false,
      isError: false,
      isSuccess: true,
      hasNextPage,
      isFetchingNextPage: false,
      fetchNextPage,
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

beforeEach(() => {
  search.mockClear()
  fetchNextPage.mockClear()
  hasNextPage = false
})

describe('LibraryPage', () => {
  it('lists the page with badges, actions and server counts', () => {
    renderPage()
    expect(screen.getByText('9 questions')).toBeInTheDocument()
    expect(screen.getByText('Put the words in order. — She has been')).toBeInTheDocument()
    expect(screen.getByText('User submitted')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reuse/ })).toBeEnabled()
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()
  })

  it('sends filters from the URL and the search box to the server', async () => {
    const user = userEvent.setup()
    renderPage('/library?status=published&type=fill')
    expect(search).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'published', type: 'fill', source: 'all', query: '' }),
    )

    await user.type(screen.getByPlaceholderText(/Search by word/), 'went')
    await waitFor(() =>
      expect(search).toHaveBeenLastCalledWith(expect.objectContaining({ query: 'went' })),
    )
    // Debounced: no request per key press.
    expect(search).not.toHaveBeenCalledWith(expect.objectContaining({ query: 'w' }))

    await user.click(screen.getByRole('button', { name: /Added by/ }))
    const menu = screen.getByRole('dialog')
    expect(within(menu).getByText('3')).toBeInTheDocument() // users count from the server
    await user.click(within(menu).getByRole('button', { name: /Users/ }))
    expect(search).toHaveBeenLastCalledWith(expect.objectContaining({ source: 'user' }))
  })

  it('loads the next page', async () => {
    hasNextPage = true
    const user = userEvent.setup()
    renderPage()
    expect(screen.getByText('2 of 7')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Load more' }))
    expect(fetchNextPage).toHaveBeenCalled()
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
