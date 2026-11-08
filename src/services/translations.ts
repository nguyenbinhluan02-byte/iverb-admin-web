import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Json } from './database.types'
import type { GrammarContent } from './lessons'

// Lesson translations (backend iverb-supabase docs/solutions/weekly-lesson.md §7).

/** The app's meaning languages except English (private.lesson_locales). */
export const LOCALES: { code: string; name: string; english: string }[] = [
  { code: 'vi', name: 'Tiếng Việt', english: 'Vietnamese' },
  { code: 'ja', name: 'Tiếng Nhật', english: 'Japanese' },
  { code: 'ko', name: 'Tiếng Hàn', english: 'Korean' },
  { code: 'zh', name: 'Tiếng Trung (Giản thể)', english: 'Simplified Chinese' },
  { code: 'id', name: 'Tiếng Indonesia', english: 'Indonesian' },
  { code: 'hi', name: 'Tiếng Hindi', english: 'Hindi' },
  { code: 'ar', name: 'Tiếng Ả Rập', english: 'Arabic' },
  { code: 'tr', name: 'Tiếng Thổ Nhĩ Kỳ', english: 'Turkish' },
  { code: 'ru', name: 'Tiếng Nga', english: 'Russian' },
  { code: 'uk', name: 'Tiếng Ukraina', english: 'Ukrainian' },
  { code: 'pl', name: 'Tiếng Ba Lan', english: 'Polish' },
  { code: 'de', name: 'Tiếng Đức', english: 'German' },
  { code: 'fr', name: 'Tiếng Pháp', english: 'French' },
  { code: 'es', name: 'Tiếng Tây Ban Nha', english: 'Spanish' },
  { code: 'pt', name: 'Tiếng Bồ Đào Nha', english: 'Portuguese' },
  { code: 'it', name: 'Tiếng Ý', english: 'Italian' },
  { code: 'nl', name: 'Tiếng Hà Lan', english: 'Dutch' },
  { code: 'no', name: 'Tiếng Na Uy', english: 'Norwegian' },
  { code: 'cs', name: 'Tiếng Séc', english: 'Czech' },
  { code: 'sk', name: 'Tiếng Slovakia', english: 'Slovak' },
  { code: 'ro', name: 'Tiếng Romania', english: 'Romanian' },
  { code: 'hu', name: 'Tiếng Hungary', english: 'Hungarian' },
  { code: 'el', name: 'Tiếng Hy Lạp', english: 'Greek' },
  { code: 'he', name: 'Tiếng Do Thái', english: 'Hebrew' },
]

export const localeName = (code: string) => LOCALES.find((l) => l.code === code)?.name ?? code

export interface LocaleCounts {
  locale: string
  fresh: number
  stale: number
  missing: number
  reviewed: number
}

export interface LessonTranslations {
  lesson_id: number
  cards_total: number
  words_total: number
  locales: LocaleCounts[]
}

export type TranslationItem =
  | {
      kind: 'card'
      id: number
      source: GrammarContent
      translation: GrammarContent | null
      status: 'machine' | 'reviewed' | null
      fresh: boolean | null
    }
  | {
      kind: 'word'
      id: number
      source: { word: string; pos: string | null; meaning: string; example: string }
      translation: { meaning: string; example: string | null } | null
      status: 'machine' | 'reviewed' | null
      fresh: boolean | null
    }

export const translationKeys = {
  summary: (lessonId: number) => ['translations', lessonId] as const,
  locale: (lessonId: number, locale: string) => ['translations', lessonId, locale] as const,
}

export function useLessonTranslations(lessonId: number | null) {
  return useQuery({
    queryKey: translationKeys.summary(lessonId ?? 0),
    enabled: lessonId != null,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_lesson_translations', { p_lesson_id: lessonId! })
      if (error) throw error
      return data as unknown as LessonTranslations
    },
  })
}

export function useLessonTranslation(lessonId: number | null, locale: string | null) {
  return useQuery({
    queryKey: translationKeys.locale(lessonId ?? 0, locale ?? ''),
    enabled: lessonId != null && !!locale,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_lesson_translation', {
        p_lesson_id: lessonId!,
        p_locale: locale!,
      })
      if (error) throw error
      return (data as unknown as { items: TranslationItem[] }).items
    },
  })
}

/** Refresh every translation query (after save / translate / review). */
export function useInvalidateTranslations() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['translations'] })
}

/** Admin edit → status reviewed. */
export function useSaveCardTranslation() {
  const invalidate = useInvalidateTranslations()
  return useMutation({
    mutationFn: async (v: { cardId: number; locale: string; content: GrammarContent }) => {
      const { error } = await supabase.rpc('admin_save_card_translation', {
        p_card_id: v.cardId,
        p_locale: v.locale,
        p_content: v.content as unknown as Json,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}

export function useSaveWordTranslation() {
  const invalidate = useInvalidateTranslations()
  return useMutation({
    mutationFn: async (v: { wordId: number; locale: string; meaning: string; example: string | null }) => {
      const { error } = await supabase.rpc('admin_save_vocab_translation', {
        p_vocab_item_id: v.wordId,
        p_locale: v.locale,
        p_meaning: v.meaning,
        p_example: v.example ?? undefined,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}

export function useSetTranslationStatus() {
  const invalidate = useInvalidateTranslations()
  return useMutation({
    mutationFn: async (v: { kind: 'card' | 'word'; id: number; locale: string; status: 'machine' | 'reviewed' }) => {
      const { error } = await supabase.rpc('admin_set_translation_status', {
        p_kind: v.kind,
        p_id: v.id,
        p_locale: v.locale,
        p_status: v.status,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}

export function useMarkLocaleReviewed() {
  const invalidate = useInvalidateTranslations()
  return useMutation({
    mutationFn: async (v: { lessonId: number; locale: string }) => {
      const { data, error } = await supabase.rpc('admin_mark_locale_reviewed', {
        p_lesson_id: v.lessonId,
        p_locale: v.locale,
      })
      if (error) throw error
      return (data as unknown as { marked: number }).marked
    },
    onSuccess: invalidate,
  })
}
