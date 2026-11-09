import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PushError, type NewPush, type Push } from '@/services/pushes'
import { NotificationsPage } from './NotificationsPage'

const send = vi.fn(async (_push: NewPush) => ({ id: 1, status: 'sent' }))
let pushes: Push[] = []
const toastSuccess = vi.fn()
const toastError = vi.fn()

vi.mock('sonner', () => ({
  toast: { success: (m: string) => toastSuccess(m), error: (m: string) => toastError(m) },
}))
// Upload goes through admin-lesson-media; here a button "uploads" a fixed URL.
vi.mock('@/features/week-editor/ImageDrop', () => ({
  ImageDrop: ({ url, onChange }: { url: string | null; onChange: (u: string | null) => void }) =>
    url ? (
      <button type="button" onClick={() => onChange(null)}>
        Remove image
      </button>
    ) : (
      <button type="button" onClick={() => onChange('https://cdn.test/push.webp')}>
        Upload image
      </button>
    ),
}))
const audienceCalls: unknown[] = []
vi.mock('@/services/users', () => ({
  useUserPage: () => ({
    isPending: false,
    data: {
      items: [
        { id: 'u-1', name: 'Lan', email: 'lan@test.dev' },
        { id: 'u-2', name: 'Minh', email: 'minh@test.dev' },
      ],
    },
  }),
}))
vi.mock('@/services/pushes', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/pushes')>()),
  usePushes: () => ({ data: pushes, isPending: false, isError: false }),
  usePushAudience: (a: unknown, enabled: boolean) => {
    if (enabled) audienceCalls.push(a)
    const ids = (a as { user_ids?: string[] }).user_ids
    return {
      isFetching: false,
      data: {
        users: ids ? ids.length : 2,
        devices: ids ? ids.length : 3,
        versions: [
          { version: '3.0.0', devices: 2 },
          { version: '3.1.0', devices: 1 },
        ],
      },
    }
  },
  useSendPush: () => ({ mutateAsync: send, isPending: false }),
}))

const push = (over: Partial<Push>): Push => ({
  id: 1,
  title: 'Hello',
  body: 'World',
  image_url: null,
  audience: null,
  sent_count: null,
  failed_count: null,
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
  expect(within(dialog).getByText(/sent to all app users/)).toBeInTheDocument()
  expect(send).not.toHaveBeenCalled()
  await user.click(within(dialog).getByRole('button', { name: 'Send' }))
  expect(send).toHaveBeenCalledWith({ title: 'New quiz', body: 'Try it now' })
  expect(toastSuccess).toHaveBeenCalledWith('Notification sent')
  expect(screen.getByPlaceholderText('New quiz is live!')).toHaveValue('')
})

test('sends the uploaded image and shows it in preview / confirm', async () => {
  const { container } = render(<NotificationsPage />)
  const user = await fill('3.1 is here', 'Learn mode is live')
  await user.click(screen.getByRole('button', { name: 'Upload image' }))
  expect(container.querySelector('img[src="https://cdn.test/push.webp"]')).toBeInTheDocument()
  await user.click(sendButton())
  const dialog = await screen.findByRole('dialog')
  expect(dialog.querySelector('img[src="https://cdn.test/push.webp"]')).toBeInTheDocument()
  await user.click(within(dialog).getByRole('button', { name: 'Send' }))
  expect(send).toHaveBeenCalledWith({
    title: '3.1 is here',
    body: 'Learn mode is live',
    image_url: 'https://cdn.test/push.webp',
  })
  // cleared after sending
  expect(screen.getByRole('button', { name: 'Upload image' })).toBeInTheDocument()
})

test('filter: sends the chosen versions / plans as an audience', async () => {
  render(<NotificationsPage />)
  const user = await fill('3.1 is here', 'Update now')
  await user.click(screen.getByRole('button', { name: 'Filter' }))
  await user.click(screen.getByRole('button', { name: /^3\.0\.0/ }))
  await user.click(screen.getByRole('button', { name: 'Free' }))
  expect(audienceCalls.at(-1)).toEqual({ versions: ['3.0.0'], statuses: ['free'] })
  expect(screen.getByText('Reaches 2 users · 3 devices')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Send to 3 devices' }))
  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByText(/Signed-in · v3\.0\.0 · Free/)).toBeInTheDocument()
  await user.click(within(dialog).getByRole('button', { name: 'Send' }))
  expect(send).toHaveBeenCalledWith({
    title: '3.1 is here',
    body: 'Update now',
    audience: { versions: ['3.0.0'], statuses: ['free'] },
  })
})

test('specific users: pick from search, send their ids', async () => {
  render(<NotificationsPage />)
  const user = await fill('Hi', 'Just for you')
  await user.click(screen.getByRole('button', { name: 'Specific users' }))
  expect(screen.getByRole('button', { name: /send to 0 devices/i })).toBeDisabled()
  await user.click(screen.getByRole('button', { name: /Minh/ }))
  expect(screen.getByRole('list', { name: 'Chosen users' })).toHaveTextContent('Minh')
  await user.click(screen.getByRole('button', { name: 'Send to 1 device' }))
  await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Send' }))
  expect(send).toHaveBeenCalledWith({
    title: 'Hi',
    body: 'Just for you',
    audience: { user_ids: ['u-2'] },
  })
})

test('history shows who a push went to and the counts', () => {
  pushes = [
    push({ id: 1, audience: { versions: ['3.0.0'] }, sent_count: 40, failed_count: 2 }),
    push({ id: 2, title: 'Everyone' }),
  ]
  render(<NotificationsPage />)
  expect(screen.getByText(/To Signed-in · v3\.0\.0 · 40 delivered, 2 failed/)).toBeInTheDocument()
  expect(screen.getByText('To All users')).toBeInTheDocument()
})

test('history shows the image of a push', () => {
  pushes = [push({ image_url: 'https://cdn.test/old.webp' })]
  const { container } = render(<NotificationsPage />)
  expect(container.querySelector('a[href="https://cdn.test/old.webp"] img')).toBeInTheDocument()
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
