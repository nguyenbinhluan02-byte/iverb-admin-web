import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Json } from './database.types'
import type { Voice } from './questions'
import { weekKeys, type LessonSummary, type LessonType, type WeekRow } from './weeks'

// Lesson of a week (backend iverb-supabase docs/solutions/weekly-lesson.md §4–5).

export type Tone = 'accent' | 'green'

export type GrammarBlock =
  | { type: 'text'; text: string }
  | { type: 'formula'; rows: { label: string; parts: string[] }[] }
  | { type: 'examples'; items: { tag?: string; sentence: string; translation?: string }[] }
  | { type: 'compare'; cols: { title: string; tone: Tone; lines: string[] }[] }
  | { type: 'signals'; groups: { title: string; tone: Tone; words: string[] }[] }
  | { type: 'mistake'; wrong: string; right: string; why?: string }
  | { type: 'tip'; text: string }
  | { type: 'check'; question: string; options: string[]; correct: number; ok: string; bad: string }

export interface GrammarContent {
  label: string
  heading: string
  blocks: GrammarBlock[]
}

export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase'

/** How the word's pronunciation was made (backend TASK-054). */
export interface AudioMeta {
  source: 'tts' | 'file'
  voice?: Voice
  /** The word the TTS file was generated from. */
  tts_text?: string
  tts_url?: string
  file_url?: string
  file_name?: string
}

export interface Word {
  id: number
  word: string
  ipa: string | null
  pos: PartOfSpeech | null
  /** English. */
  meaning: string
  /** Highlighted word(s) in *stars*. */
  example: string
  example_translation: string | null
  image_url: string | null
  audio_url: string | null
  audio_meta: AudioMeta | null
}

export type LessonCard =
  | { id: number; kind: 'grammar'; content: GrammarContent }
  | { id: number; kind: 'vocab'; word: Word }

export interface LessonDetail extends LessonSummary {
  cards: LessonCard[]
  questions: { id: number; date: string; type: string; prompt: string; lesson_card_id: number | null }[]
  tagged_question_ids: number[]
  learners: { started: number; completed: number }
}

export interface SaveLessonPayload {
  type: LessonType
  title: string
  cover_url: string | null
  cards: (
    | { id?: number; kind: 'grammar'; content: GrammarContent }
    | {
        id?: number
        kind: 'vocab'
        word: {
          word: string
          ipa: string | null
          pos: PartOfSpeech | null
          meaning: string
          example: string
          image_url: string | null
          audio_url: string | null
          audio_meta: AudioMeta | null
        }
      }
  )[]
}

export const lessonKeys = {
  week: (weekStart: string) => ['weeks', 'lesson', weekStart] as const,
}

/** The week's row (status, question days) and its lesson, if any. */
export function useWeekLesson(weekStart: string) {
  return useQuery({
    queryKey: lessonKeys.week(weekStart),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_lesson_weeks', {
        p_from: weekStart,
        p_to: weekStart,
      })
      if (error) throw error
      const week = (data as unknown as WeekRow[])[0]
      if (!week?.lesson) return { week, lesson: null as LessonDetail | null }
      const res = await supabase.rpc('admin_get_lesson', { p_id: week.lesson.id })
      if (res.error) throw res.error
      return { week, lesson: res.data as unknown as LessonDetail }
    },
  })
}

export function useSaveWeekLesson(weekStart: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (lesson: SaveLessonPayload) => {
      const { data, error } = await supabase.rpc('admin_save_week_lesson', {
        p_week_start: weekStart,
        p_lesson: lesson as unknown as Json,
      })
      if (error) throw error
      return data as unknown as LessonDetail
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: weekKeys.all })
    },
  })
}

// ---------------------------------------------------------------------------
// Media (Edge Function admin-lesson-media) and translations (admin-translate)

async function functionError(error: unknown): Promise<Error> {
  const response = (error as { context?: unknown })?.context
  if (response instanceof Response) {
    try {
      const body = (await response.clone().json()) as { error?: unknown }
      if (typeof body?.error === 'string') return new Error(MEDIA_ERRORS[body.error] ?? body.error)
    } catch {
      // not JSON
    }
  }
  return error instanceof Error ? error : new Error(String(error))
}

const MEDIA_ERRORS: Record<string, string> = {
  unauthorized: 'Your session has expired. Sign in again.',
  not_admin: 'Only admins can add media.',
  invalid_file: 'Choose a JPG, PNG or WebP image, or an MP3, M4A or WAV file.',
  too_large: 'The file must be 5 MB or smaller.',
  invalid_text: 'Type the word first.',
  not_configured: 'Text-to-speech is not set up yet (GOOGLE_TTS_API_KEY).',
  tts_failed: 'Could not generate the audio. Try again.',
  upload_failed: 'Could not save the file. Try again.',
}

export async function uploadLessonMedia(file: File) {
  const body = new FormData()
  body.append('file', file)
  const { data, error } = await supabase.functions.invoke('admin-lesson-media', { body })
  if (error) throw await functionError(error)
  return data as { url: string; kind: 'image' | 'audio'; file_name: string; file_size: number }
}

/** Same text + voice → same file. */
export async function speakWord(text: string, voice: Voice) {
  const { data, error } = await supabase.functions.invoke('admin-lesson-media', {
    body: { text, voice },
  })
  if (error) throw await functionError(error)
  return (data as { url: string }).url
}

export interface TranslateResult {
  saved: { cards: number; words: number }
  remaining: number
  errors: { locale: string; item: string; error: string }[]
}

/**
 * Translates missing / outdated languages. The function stops after ~90 s and
 * reports what is left, so it is called again until nothing remains.
 */
export async function translateLesson(
  lessonId: number,
  options: { locales?: string[]; force?: boolean } = {},
): Promise<TranslateResult> {
  const total: TranslateResult = { saved: { cards: 0, words: 0 }, remaining: 0, errors: [] }
  for (let round = 0; round < 6; round++) {
    const { data, error } = await supabase.functions.invoke('admin-translate', {
      // force only on the first call: later calls finish what is left.
      body: { lesson_id: lessonId, locales: options.locales, force: round === 0 && !!options.force },
    })
    if (error) throw await functionError(error)
    const r = data as TranslateResult
    total.saved.cards += r.saved.cards
    total.saved.words += r.saved.words
    total.remaining = r.remaining
    total.errors = r.errors
    if (r.remaining === 0) break
  }
  return total
}
