import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { todayUTC } from '@/lib/dates'
import type { AdminUser, UserFilters } from '@/services/users'
import { UsersPage } from './UsersPage'

const now = new Date().toISOString()
const users: AdminUser[] = [
  {
    id: 'u-1',
    name: 'Nguyễn Văn Đức',
    email: 'duc@test.dev',
    avatar_url: null,
    role: 'user',
    provider: 'google',
    status: 'active',
    plan: 'yearly',
    plan_expires_at: '2027-03-05T00:00:00+00:00',
    joined_at: '2026-10-03T00:00:00+00:00',
    last_active_at: now,
  },
  {
    id: 'u-2',
    name: 'Anna',
    email: 'anna@test.dev',
    avatar_url: null,
    role: 'user',
    provider: 'apple',
    status: 'expired',
    plan: 'gift',
    plan_expires_at: '2026-10-01T00:00:00+00:00',
    joined_at: '2025-01-10T00:00:00+00:00',
    last_active_at: null,
  },
]

const requests = vi.fn((filters: UserFilters, page: number) => [filters, page])
const details = vi.fn()

vi.mock('@/services/users', async (orig) => ({
  ...(await orig<typeof import('@/services/users')>()),
  useUserPage: (filters: UserFilters, page: number) => {
    requests(filters, page)
    return {
      data: {
        items: users,
        total: 30,
        page,
        page_size: 12,
        counts: {
          status: { all: 30, active: 10, expired: 5, free: 15 },
          plan: { all: 30, premium: 8, gift: 7, none: 15 },
          provider: { all: 30, google: 25, apple: 4, email: 1 },
        },
        first_joined_at: '2025-01-10T00:00:00+00:00',
      },
      isPending: false,
      isError: false,
      isSuccess: true,
      isPlaceholderData: false,
    }
  },
  useUserDetail: (id: string | null) => {
    details(id)
    const u = users.find((x) => x.id === id)
    return {
      data: u && {
        ...u,
        stats: {
          answered: 40,
          accuracy_pct: 75,
          streak_days: 3,
          community_answers: 2,
          submissions: 0,
          reports_received: 1,
        },
      },
      isError: false,
    }
  },
}))

const renderPage = (path = '/users') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <UsersPage />
    </MemoryRouter>,
  )

beforeEach(() => {
  requests.mockClear()
  details.mockClear()
})

describe('UsersPage', () => {
  it('lists users and shows the first one in the detail panel', () => {
    renderPage()
    expect(screen.getByText('30 accounts · read only')).toBeInTheDocument()
    const panel = screen.getByRole('complementary', { name: 'User details' })
    expect(within(panel).getByText('Nguyễn Văn Đức')).toBeInTheDocument()
    expect(within(panel).getByText('Renews')).toBeInTheDocument()
    expect(within(panel).getByText('75%')).toBeInTheDocument()
    expect(within(panel).getByText('3 days')).toBeInTheDocument()
    expect(screen.getByText('Ended Oct 1, 2026')).toBeInTheDocument()
    // Read only: nothing to edit or delete.
    expect(screen.queryByRole('button', { name: /edit|delete/i })).not.toBeInTheDocument()
  })

  it('selects a row to show its details', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /Anna/ }))
    const panel = screen.getByRole('complementary', { name: 'User details' })
    expect(within(panel).getByText(/Plan ended Oct 1, 2026/)).toBeInTheDocument()
    expect(details).toHaveBeenLastCalledWith('u-2')
  })

  it('filters reset to page 1', async () => {
    const user = userEvent.setup()
    renderPage('/users?page=2')
    expect(requests).toHaveBeenLastCalledWith(expect.anything(), 2)

    await user.click(screen.getByRole('button', { name: /Plan/ }))
    await user.click(screen.getByRole('button', { name: /^Free gift/ }))
    expect(requests).toHaveBeenLastCalledWith(expect.objectContaining({ plan: 'gift' }), 1)
  })

  it('month picker: future months disabled, pick and clear', async () => {
    const user = userEvent.setup()
    renderPage()
    const today = todayUTC()
    const thisYear = Number(today.slice(0, 4))
    const month = Number(today.slice(5, 7))

    await user.click(screen.getByRole('button', { name: /Joined/ }))
    const picker = screen.getByRole('dialog', { name: 'Joined month' })
    expect(within(picker).getByText(String(thisYear))).toBeInTheDocument()
    expect(within(picker).getByRole('button', { name: 'Next year' })).toBeDisabled()
    if (month < 12) expect(within(picker).getByRole('button', { name: 'Dec' })).toBeDisabled()

    await user.click(within(picker).getByRole('button', { name: 'Jan' }))
    expect(requests).toHaveBeenLastCalledWith(
      expect.objectContaining({ joined: `${thisYear}-01` }),
      1,
    )
    expect(screen.queryByRole('dialog', { name: 'Joined month' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Joined/ }))
    await user.click(screen.getByRole('button', { name: 'Any month' }))
    expect(requests).toHaveBeenLastCalledWith(expect.objectContaining({ joined: '' }), 1)
  })
})
