import { describe, expect, it } from 'vitest'
import type { LessonDetail } from '@/services/lessons'
import {
  audioStatus,
  formulaParts,
  fromLesson,
  needsSpeech,
  newVocabCard,
  splitStarred,
  toPayload,
  type LessonForm,
} from './editorModel'

const lesson = (cards: LessonDetail['cards'], type: 'grammar' | 'vocab' = 'grammar') =>
  ({ id: 1, type, title: 'T', cover_url: null, cards }) as unknown as LessonDetail

describe('editorModel', () => {
  it('grammar round trip: formula text, compare lines, signal words', () => {
    const form = fromLesson(
      lesson([
        {
          id: 11,
          kind: 'grammar',
          content: {
            label: 'Rule',
            heading: 'H',
            blocks: [
              { type: 'formula', rows: [{ label: 'Past', parts: ['S', 'V2', '…'] }] },
              { type: 'compare', cols: [{ title: 'A', tone: 'accent', lines: ['x', 'y'] }, { title: 'B', tone: 'green', lines: ['z'] }] },
              { type: 'signals', groups: [{ title: 'G', tone: 'green', words: ['ever', 'never'] }] },
              { type: 'examples', items: [{ tag: 't', sentence: 'I *went*.' }, { sentence: 'No tag.' }] },
              { type: 'mistake', wrong: 'w', right: 'r' },
            ],
          },
        },
      ]),
    )
    const b = form.grammar[0].blocks
    expect(b[0]).toEqual({ type: 'formula', rows: [{ label: 'Past', text: 'S + V2 + …' }] })
    expect(b[1]).toMatchObject({ cols: [{ lines: 'x\ny' }, { lines: 'z' }] })
    expect(b[2]).toMatchObject({ groups: [{ words: 'ever, never' }] })

    const payload = toPayload(form)
    expect(payload.cards[0]).toEqual({
      id: 11,
      kind: 'grammar',
      content: {
        label: 'Rule',
        heading: 'H',
        blocks: [
          { type: 'formula', rows: [{ label: 'Past', parts: ['S', 'V2', '…'] }] },
          { type: 'compare', cols: [{ title: 'A', tone: 'accent', lines: ['x', 'y'] }, { title: 'B', tone: 'green', lines: ['z'] }] },
          { type: 'signals', groups: [{ title: 'G', tone: 'green', words: ['ever', 'never'] }] },
          { type: 'examples', items: [{ tag: 't', sentence: 'I *went*.' }, { sentence: 'No tag.' }] },
          { type: 'mistake', wrong: 'w', right: 'r' },
        ],
      },
    })
  })

  it('only the active type is saved', () => {
    const form: LessonForm = { ...fromLesson(null), title: ' X ', vocab: [{ ...newVocabCard(), word: 'gate' }] }
    expect(toPayload(form)).toMatchObject({ type: 'grammar', title: 'X', cards: [] })
    expect(toPayload({ ...form, type: 'vocab' }).cards).toHaveLength(1)
  })

  it('pronunciation status', () => {
    const c = { ...newVocabCard(), word: 'board' }
    expect(audioStatus({ ...c, word: ' ' })).toBe('no-word')
    expect(audioStatus(c)).toBe('pending')
    const made = { ...c, ttsUrl: 'u', ttsText: 'board', ttsVoice: c.voice }
    expect(audioStatus(made)).toBe('ready')
    expect(audioStatus({ ...made, word: 'boards' })).toBe('pending')
    expect(audioStatus({ ...made, voice: 'uk-m' })).toBe('pending')
    expect(needsSpeech({ ...made, audioSource: 'file' })).toBe(false)
    // the uploaded file is used; the TTS file is kept
    const payload = toPayload({
      ...fromLesson(null),
      type: 'vocab',
      title: 't',
      vocab: [{ ...made, audioSource: 'file', fileUrl: 'f', fileName: 'me.m4a' }],
    })
    expect(payload.cards[0]).toMatchObject({
      word: {
        audio_url: 'f',
        audio_meta: { source: 'file', tts_url: 'u', tts_text: 'board', file_url: 'f', file_name: 'me.m4a' },
      },
    })
  })

  it('words saved before audio_meta count as generated', () => {
    const form = fromLesson(
      lesson(
        [
          {
            id: 5,
            kind: 'vocab',
            word: {
              id: 9, word: 'board', ipa: null, pos: 'verb', meaning: 'm', example: '*board*',
              example_translation: null, image_url: null, audio_url: 'https://x/a.m4a', audio_meta: null,
            },
          },
        ],
        'vocab',
      ),
    )
    expect(audioStatus(form.vocab[0])).toBe('ready')
  })

  it('helpers', () => {
    expect(formulaParts(' S +  have / has + V3 + … ')).toEqual(['S', 'have / has', 'V3', '…'])
    expect(splitStarred('I *have* never *been* there.')).toEqual([
      { text: 'I ', marked: false },
      { text: 'have', marked: true },
      { text: ' never ', marked: false },
      { text: 'been', marked: true },
      { text: ' there.', marked: false },
    ])
  })
})
