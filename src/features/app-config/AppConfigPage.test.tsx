import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { AppConfig } from '@/services/appConfig'
import { AppConfigPage } from './AppConfigPage'
import { appConfigDraft } from './draftStore'

const saved: AppConfig = {
  lesson_interstitial_every: 1,
  lesson_native_ad_every: 3,
  story_native_ad_every: 3,
  day_story_banner: 1,
  question_interstitial_every: 2,
  free_can_answer: 0,
  verb_detail_interstitial_every: 5,
  answer_trial_days: 30,
  lesson_preview_cards: 2,
  privacy_url: 'https://example.com/privacy',
  terms_url: 'https://example.com/terms',
}
const mutateAsync = vi.fn(async (v: Partial<AppConfig>) => ({ ...saved, ...v }))

const useAppConfigData = { current: saved }
vi.mock('@/services/appConfig', () => ({
  useAppConfig: () => ({ data: useAppConfigData.current, isLoading: false, error: null }),
  useSaveAppConfig: () => ({ mutateAsync, isPending: false }),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

describe('AppConfigPage', () => {
  beforeEach(() => {
    appConfigDraft.clear()
    mutateAsync.mockClear()
  })

  it('saves only the changed keys', async () => {
    const user = userEvent.setup()
    render(<AppConfigPage />)

    expect(screen.getByRole('button', { name: 'Saved' })).toBeDisabled()
    expect(screen.queryByText('App versions')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Decrease On lessons' }))
    expect(screen.getByText('Off · no full-screen ads')).toBeInTheDocument()
    expect(screen.getByText('Edited · was 1')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Increase Lesson preview' }))
    await user.click(screen.getByRole('button', { name: 'Save 2 changes' }))
    expect(mutateAsync).toHaveBeenCalledWith({
      lesson_interstitial_every: 0,
      lesson_preview_cards: 3,
    })
    expect(screen.getByRole('button', { name: 'Saved' })).toBeInTheDocument()
  })

  it('the story banner switch saves 0 / 1', async () => {
    const user = userEvent.setup()
    render(<AppConfigPage />)

    const banner = screen.getByRole('switch', { name: 'Banner in past-day story' })
    expect(banner).toHaveAttribute('aria-checked', 'true')
    await user.click(banner)
    expect(banner).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByText('Hidden')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Save 1 change' }))
    expect(mutateAsync).toHaveBeenCalledWith({ day_story_banner: 0 })
  })

  it('keys missing on the server are unavailable and do not block saving', async () => {
    const user = userEvent.setup()
    const { day_story_banner: _banner, ...older } = saved
    void _banner
    useAppConfigData.current = older as AppConfig
    render(<AppConfigPage />)

    expect(
      screen.queryByRole('switch', { name: 'Banner in past-day story' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Not on the server yet')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Increase Answer trial' }))
    expect(screen.getByRole('button', { name: 'Save 1 change' })).toBeEnabled()
    useAppConfigData.current = saved
  })

  it('blocks saving an invalid link; Discard resets', async () => {
    const user = userEvent.setup()
    render(<AppConfigPage />)

    const input = screen.getByLabelText('Privacy policy')
    await user.clear(input)
    await user.type(input, 'http://x.com')
    expect(screen.getByText('Must be a full https:// link')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fix errors to save' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Discard' }))
    expect(screen.getByLabelText('Privacy policy')).toHaveValue('https://example.com/privacy')
    expect(screen.getByRole('button', { name: 'Saved' })).toBeDisabled()
  })

  it('setting a value back to the saved one is not a change', async () => {
    const user = userEvent.setup()
    render(<AppConfigPage />)
    await user.click(screen.getByRole('button', { name: 'Increase Answer trial' }))
    await user.click(screen.getByRole('button', { name: 'Decrease Answer trial' }))
    expect(screen.getByRole('button', { name: 'Saved' })).toBeDisabled()
  })
})
