import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AiImage } from './CardEditor'
import { newVocabCard } from './editorModel'

const generateWordImage = vi.fn()
vi.mock('@/services/lessons', () => ({
  generateWordImage: (w: unknown) => generateWordImage(w),
  speakWord: vi.fn(),
  uploadLessonMedia: vi.fn(),
}))

beforeEach(() => generateWordImage.mockReset())

describe('AiImage', () => {
  it('is disabled until the word is typed', () => {
    render(<AiImage card={newVocabCard()} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /generate with ai/i })).toBeDisabled()
  })

  it('sends word, part of speech, example and hint, then sets the image', async () => {
    generateWordImage.mockResolvedValue('https://x.supabase.co/img.webp')
    const onChange = vi.fn()
    const card = { ...newVocabCard(), word: 'board ', pos: 'verb' as const, example: 'We *board* at 7.' }
    render(<AiImage card={card} onChange={onChange} />)
    await userEvent.type(screen.getByPlaceholderText(/hint for ai/i), 'people walking onto a plane')
    await userEvent.click(screen.getByRole('button', { name: /generate with ai/i }))
    expect(generateWordImage).toHaveBeenCalledWith({
      word: 'board',
      pos: 'verb',
      example: 'We *board* at 7.',
      hint: 'people walking onto a plane',
    })
    expect(onChange).toHaveBeenCalledWith({ ...card, imageUrl: 'https://x.supabase.co/img.webp' })
  })

  it('says Regenerate when there is an image', () => {
    render(<AiImage card={{ ...newVocabCard(), word: 'gate', imageUrl: 'https://a/b.webp' }} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /regenerate with ai/i })).toBeEnabled()
  })
})
