import type {
  AudioMeta,
  GrammarBlock,
  LessonDetail,
  PartOfSpeech,
  SaveLessonPayload,
  Tone,
} from '@/services/lessons'
import type { Voice } from '@/services/questions'
import type { LessonType } from '@/services/weeks'

// Week editor form state (design Weekly Lessons.dc.html "WEEK EDITOR"),
// converted from / to the backend shapes (admin_get_lesson /
// admin_save_week_lesson). Lists are edited as text where the design does:
// formula parts "S + have / has + V3 + …", compare lines one per row, signal
// words comma separated.

export type BlockType = GrammarBlock['type']

export type EditorBlock =
  | { type: 'text'; text: string }
  | { type: 'tip'; text: string }
  | { type: 'formula'; rows: { label: string; text: string }[] }
  | { type: 'examples'; items: { tag: string; sentence: string }[] }
  | { type: 'compare'; cols: { title: string; tone: Tone; lines: string }[] }
  | { type: 'signals'; groups: { title: string; tone: Tone; words: string }[] }
  | { type: 'mistake'; wrong: string; right: string; why: string }
  | { type: 'check'; question: string; options: string[]; correct: number; ok: string; bad: string }

export interface GrammarCardForm {
  key: string
  id?: number
  kind: 'grammar'
  label: string
  heading: string
  blocks: EditorBlock[]
}

export interface VocabCardForm {
  key: string
  id?: number
  kind: 'vocab'
  word: string
  ipa: string
  pos: PartOfSpeech
  meaning: string
  example: string
  imageUrl: string | null
  /** Pronunciation: generated (TTS) or the admin's recording. */
  audioSource: 'tts' | 'file'
  voice: Voice
  /** Last generated TTS file and the word it was made from. */
  ttsUrl: string | null
  ttsText: string | null
  ttsVoice: Voice | null
  fileUrl: string | null
  fileName: string | null
}

export type CardForm = GrammarCardForm | VocabCardForm

export interface LessonForm {
  type: LessonType
  title: string
  coverUrl: string | null
  /** Both lists are kept so switching the type back loses nothing. */
  grammar: GrammarCardForm[]
  vocab: VocabCardForm[]
}

export const CARD_LABELS = ['Overview', 'Structure', 'Rule', 'Signal words', 'Common mistake', 'Summary']
export const PARTS_OF_SPEECH: PartOfSpeech[] = ['noun', 'verb', 'adjective', 'adverb', 'phrase']
export const VOICES: { id: Voice; label: string }[] = [
  { id: 'us-f', label: 'US · Female' },
  { id: 'us-m', label: 'US · Male' },
  { id: 'uk-f', label: 'UK · Female' },
  { id: 'uk-m', label: 'UK · Male' },
]
export const BLOCK_NAMES: Record<BlockType, string> = {
  text: 'Text',
  formula: 'Formula',
  examples: 'Examples',
  compare: 'Compare',
  signals: 'Signal words',
  mistake: 'Common mistake',
  tip: 'Tip',
  check: 'Quick check',
}
/** Above this the editor warns (backend max 6). */
export const BLOCKS_WARN = 3
export const BLOCKS_MAX = 6

let seq = 0
export const newKey = () => `new-${Date.now().toString(36)}-${seq++}`

export function newBlock(type: BlockType): EditorBlock {
  switch (type) {
    case 'text':
    case 'tip':
      return { type, text: '' }
    case 'formula':
      return { type, rows: [{ label: 'Positive', text: 'S + V + …' }] }
    case 'examples':
      return { type, items: [{ tag: '', sentence: '' }] }
    case 'compare':
      return {
        type,
        cols: [
          { title: '', tone: 'accent', lines: '' },
          { title: '', tone: 'green', lines: '' },
        ],
      }
    case 'signals':
      return { type, groups: [{ title: '', tone: 'accent', words: '' }] }
    case 'mistake':
      return { type, wrong: '', right: '', why: '' }
    case 'check':
      return { type, question: '', options: ['', ''], correct: 0, ok: '', bad: '' }
  }
}

export function newGrammarCard(): GrammarCardForm {
  return { key: newKey(), kind: 'grammar', label: 'Rule', heading: '', blocks: [newBlock('text')] }
}

export function newVocabCard(): VocabCardForm {
  return {
    key: newKey(),
    kind: 'vocab',
    word: '',
    ipa: '',
    pos: 'noun',
    meaning: '',
    example: '',
    imageUrl: null,
    audioSource: 'tts',
    voice: 'us-f',
    ttsUrl: null,
    ttsText: null,
    ttsVoice: null,
    fileUrl: null,
    fileName: null,
  }
}

// ---------------------------------------------------------------------------
// Backend → form

function toEditorBlock(b: GrammarBlock): EditorBlock {
  switch (b.type) {
    case 'text':
    case 'tip':
      return { type: b.type, text: b.text }
    case 'formula':
      return { type: 'formula', rows: b.rows.map((r) => ({ label: r.label, text: r.parts.join(' + ') })) }
    case 'examples':
      return { type: 'examples', items: b.items.map((i) => ({ tag: i.tag ?? '', sentence: i.sentence })) }
    case 'compare':
      return {
        type: 'compare',
        cols: b.cols.map((c) => ({ title: c.title, tone: c.tone, lines: c.lines.join('\n') })),
      }
    case 'signals':
      return {
        type: 'signals',
        groups: b.groups.map((g) => ({ title: g.title, tone: g.tone, words: g.words.join(', ') })),
      }
    case 'mistake':
      return { type: 'mistake', wrong: b.wrong, right: b.right, why: b.why ?? '' }
    case 'check':
      return {
        type: 'check',
        question: b.question,
        options: [...b.options],
        correct: b.correct,
        ok: b.ok,
        bad: b.bad,
      }
  }
}

export function fromLesson(lesson: LessonDetail | null): LessonForm {
  const form: LessonForm = {
    type: lesson?.type ?? 'grammar',
    title: lesson?.title ?? '',
    coverUrl: lesson?.cover_url ?? null,
    grammar: [],
    vocab: [],
  }
  for (const card of lesson?.cards ?? []) {
    if (card.kind === 'grammar') {
      form.grammar.push({
        key: `card-${card.id}`,
        id: card.id,
        kind: 'grammar',
        label: card.content.label,
        heading: card.content.heading,
        blocks: card.content.blocks.map(toEditorBlock),
      })
    } else {
      const w = card.word
      const meta: AudioMeta = w.audio_meta ?? { source: 'tts' }
      form.vocab.push({
        key: `card-${card.id}`,
        id: card.id,
        kind: 'vocab',
        word: w.word,
        ipa: w.ipa ?? '',
        pos: w.pos ?? 'noun',
        meaning: w.meaning,
        example: w.example,
        imageUrl: w.image_url,
        audioSource: meta.source,
        voice: meta.voice ?? 'us-f',
        // Words saved before TASK-054 have audio but no meta: treat it as
        // generated from the current word.
        ttsUrl: meta.tts_url ?? (w.audio_meta ? null : w.audio_url),
        ttsText: meta.tts_text ?? (w.audio_meta ? null : w.word),
        ttsVoice: meta.voice ?? (w.audio_meta ? null : 'us-f'),
        fileUrl: meta.file_url ?? null,
        fileName: meta.file_name ?? null,
      })
    }
  }
  return form
}

// ---------------------------------------------------------------------------
// Form → backend

const clean = (s: string) => s.trim()
const optional = (s: string) => (s.trim() ? s.trim() : undefined)

export function formulaParts(text: string): string[] {
  return text
    .split('+')
    .map((p) => p.trim())
    .filter(Boolean)
}

const listLines = (text: string) =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

const listWords = (text: string) =>
  text
    .split(',')
    .map((w) => w.trim())
    .filter(Boolean)

export function toGrammarBlock(b: EditorBlock): GrammarBlock {
  switch (b.type) {
    case 'text':
    case 'tip':
      return { type: b.type, text: clean(b.text) }
    case 'formula':
      return {
        type: 'formula',
        rows: b.rows
          .filter((r) => r.label.trim() || r.text.trim())
          .map((r) => ({ label: clean(r.label), parts: formulaParts(r.text) })),
      }
    case 'examples':
      return {
        type: 'examples',
        items: b.items
          .filter((i) => i.sentence.trim())
          .map((i) => ({ ...(optional(i.tag) ? { tag: optional(i.tag) } : {}), sentence: clean(i.sentence) })),
      }
    case 'compare':
      return {
        type: 'compare',
        cols: b.cols.map((c) => ({ title: clean(c.title), tone: c.tone, lines: listLines(c.lines) })),
      }
    case 'signals':
      return {
        type: 'signals',
        groups: b.groups
          .filter((g) => g.title.trim() || g.words.trim())
          .map((g) => ({ title: clean(g.title), tone: g.tone, words: listWords(g.words) })),
      }
    case 'mistake':
      return {
        type: 'mistake',
        wrong: clean(b.wrong),
        right: clean(b.right),
        ...(optional(b.why) ? { why: optional(b.why) } : {}),
      }
    case 'check': {
      const options = b.options.map(clean)
      return { type: 'check', question: clean(b.question), options, correct: b.correct, ok: clean(b.ok), bad: clean(b.bad) }
    }
  }
}

/** Audio in use and how it was made (after `withAudio` generated what was missing). */
export function wordAudio(card: VocabCardForm): { url: string | null; meta: AudioMeta } {
  const meta: AudioMeta = {
    source: card.audioSource,
    voice: card.voice,
    ...(card.ttsUrl ? { tts_url: card.ttsUrl, tts_text: card.ttsText ?? undefined } : {}),
    ...(card.fileUrl ? { file_url: card.fileUrl, file_name: card.fileName ?? undefined } : {}),
  }
  const url = card.audioSource === 'file' ? card.fileUrl : card.ttsUrl
  return { url, meta }
}

export function toPayload(form: LessonForm): SaveLessonPayload {
  const cards =
    form.type === 'grammar'
      ? form.grammar.map((c) => ({
          ...(c.id ? { id: c.id } : {}),
          kind: 'grammar' as const,
          content: { label: clean(c.label), heading: clean(c.heading), blocks: c.blocks.map(toGrammarBlock) },
        }))
      : form.vocab.map((c) => {
          const audio = wordAudio(c)
          return {
            ...(c.id ? { id: c.id } : {}),
            kind: 'vocab' as const,
            word: {
              word: clean(c.word),
              ipa: optional(c.ipa) ?? null,
              pos: c.pos,
              meaning: clean(c.meaning),
              example: clean(c.example),
              image_url: c.imageUrl,
              audio_url: audio.url,
              audio_meta: audio.meta,
            },
          }
        })
  return { type: form.type, title: clean(form.title), cover_url: form.coverUrl, cards }
}

// ---------------------------------------------------------------------------
// Pronunciation status (design: No word yet · Generates on save · Ready)

export type AudioStatus = 'no-word' | 'pending' | 'ready'

export function audioStatus(card: VocabCardForm): AudioStatus {
  if (card.audioSource === 'file') return card.fileUrl ? 'ready' : 'pending'
  if (!card.word.trim()) return 'no-word'
  return card.ttsUrl && card.ttsText === card.word.trim() && card.ttsVoice === card.voice
    ? 'ready'
    : 'pending'
}

/** Words whose generated audio must be (re)made before saving. */
export function needsSpeech(card: VocabCardForm): boolean {
  return card.audioSource === 'tts' && audioStatus(card) === 'pending'
}

export function lessonReady(form: LessonForm): boolean {
  const cards = form.type === 'grammar' ? form.grammar : form.vocab
  return !!form.title.trim() && cards.length > 0
}

export function cardsOf(form: LessonForm): CardForm[] {
  return form.type === 'grammar' ? form.grammar : form.vocab
}

/** Splits "I *went* home" into plain / highlighted parts (like the app). */
export function splitStarred(text: string): { text: string; marked: boolean }[] {
  return text
    .split('*')
    .map((part, i) => ({ text: part, marked: i % 2 === 1 }))
    .filter((p) => p.text !== '')
}
