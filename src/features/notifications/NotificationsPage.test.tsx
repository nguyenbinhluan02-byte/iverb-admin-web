import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PushError, type Push } from '@/services/pushes'
import { NotificationsPage } from './NotificationsPage'

const send = vi.fn(async (_push: { title: string; body: string }) => ({ id: 1, status: 'sent' }))
let pushes: Push[] = []
const toastSuccess = vi.fn()
const toastError = vi.fn()

vi.mock('sonner', () => ({
  toast: { success: (m: string) => toastSuccess(m), error: (m: string) => toastError(m) },
}))
vi.mock('@/services/pushes', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/pushes')>()),
  usePushes: () => ({ data: pushes, isPending: false, isError: false }),
  useSendPush: () => ({ mutateAsync: send, isPending: false }),
}))

const push = (over: Partial<Push>): Push => ({
  id: 1,
  title: 'Hello',
  body: 'World',
  status: 'sent',
  error: null,
  sent_by: { name: 'Luan' },
  created_at: new Date().toISOString(),
  ...over,
})

beforeEach(() => {
  send.mockClear()
  toastSuccess.mockClear()
  toastError.mockClear()
  pushes = []
})

const sendButton = () => screen.getByRole('button', { name: /send to all users/i })

async function fill(title: string, body: string) {
  const user = userEvent.setup()
  if (title) await user.type(screen.getByPlaceholderText('New quiz is live!'), title)
  if (body) await user.type(screen.getByRole('textbox', { name: /message/i }), body)
  return user
}

test('counts characters and only enables Send when valid', async () => {
  render(<NotificationsPage />)
  expect(sendButton()).toBeDisabled()
  await fill('  Hi  ', '')
  expect(screen.getByText('2 / 100')).toBeInTheDocument()
  expect(sendButton()).toBeDisabled()
  const user = await fill('', 'Body')
  expect(screen.getByText('4 / 300')).toBeInTheDocument()
  expect(sendButton()).toBeEnabled()
  await user.type(screen.getByPlaceholderText('New quiz is live!'), 'x'.repeat(100))
  expect(screen.getByText('104 / 100')).toBeInTheDocument()
  expect(sendButton()).toBeDisabled()
})

test('asks for confirmation, then sends trimmed title / body', async () => {
  render(<NotificationsPage />)
  const user = await fill('  New quiz  ', '  Try it now ')
  await user.click(sendButton())
  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByText(/sent to all app users \(Android\)/)).toBeInTheDocument()
  expect(send).not.toHaveBeenCalled()
  await user.click(within(dialog).getByRole('button', { name: 'Send' }))
  expect(send).toHaveBeenCalledWith({ title: 'New quiz', body: 'Try it now' })
  expect(toastSuccess).toHaveBeenCalledWith('Notification sent')
  expect(screen.getByPlaceholderText('New quiz is live!')).toHaveValue('')
})

test.each([
  ['not_configured', 'Push is not set up on the server yet (FCM_SERVICE_ACCOUNT).'],
  ['send_failed', 'Firebase rejected the notification. Try again.'],
  ['invalid_push', 'Title and message are required.'],
  ['not_admin', "You don't have permission."],
  ['unauthorized', "You don't have permission."],
])('maps %s to a clear toast', async (code, message) => {
  send.mockRejectedValueOnce(new PushError(code))
  render(<NotificationsPage />)
  const user = await fill('T', 'B')
  await user.click(sendButton())
  await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Send' }))
  expect(toastError).toHaveBeenCalledWith(message)
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})

test('shows history with statuses', () => {
  pushes = [
    push({ id: 3, title: 'Third', status: 'sending' }),
    push({ id: 2, title: 'Second', status: 'failed', error: 'FCM 401' }),
    push({ id: 1, title: 'First', status: 'sent' }),
  ]
  render(<NotificationsPage />)
  expect(screen.getByText('Sending')).toBeInTheDocument()
  expect(screen.getByText('Failed')).toBeInTheDocument()
  expect(screen.getByText('Sent', { selector: 'span' })).toBeInTheDocument()
  expect(screen.getByText('FCM 401')).toBeInTheDocument()
  expect(screen.getAllByText(/by Luan/)).toHaveLength(3)
})

test('empty history', () => {
  render(<NotificationsPage />)
  expect(screen.getByText('No notifications sent yet.')).toBeInTheDocument()
})
