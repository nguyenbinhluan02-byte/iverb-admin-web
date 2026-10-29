import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'

type Listener = (event: string, session: unknown) => void
const listeners: Listener[] = []
let session: unknown = null

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session } }),
      onAuthStateChange: (cb: Listener) => {
        listeners.push(cb)
        return { data: { subscription: { unsubscribe() {} } } }
      },
      signInWithPassword: async () => {
        session = { user: { id: 'u1' } }
        listeners.forEach((l) => l('SIGNED_IN', session))
        return { error: null }
      },
      signOut: async () => {
        session = null
        listeners.forEach((l) => l('SIGNED_OUT', null))
      },
    },
  },
}))

const getMe = vi.fn()
vi.mock('@/services/me', () => ({ getMe: () => getMe() }))

function Probe() {
  const { status, signIn } = useAuth()
  return (
    <>
      <span data-testid="status">{status}</span>
      <button type="button" onClick={() => signIn('a@b.c', 'pw')}>
        Sign in
      </button>
    </>
  )
}

const renderAuth = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </QueryClientProvider>,
  )

describe('AuthProvider', () => {
  it('shows get_me errors and asks again on the next sign-in', async () => {
    const user = userEvent.setup()
    getMe.mockRejectedValueOnce(new Error('Invalid schema: api'))
    renderAuth()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('signed-out'))

    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('error'))

    // Server fixed: signing in again (same user, same tab) must call get_me again.
    getMe.mockResolvedValueOnce({ id: 'u1', role: 'admin' })
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('admin'))
    expect(getMe).toHaveBeenCalledTimes(2)
  })
})
