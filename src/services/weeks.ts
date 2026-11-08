import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Weekly lessons (backend iverb-supabase docs/solutions/weekly-lesson.md §5 Admin).

export type LessonType = 'grammar' | 'vocab'
export type WeekTime = 'unscheduled' | 'upcoming' | 'live' | 'ended'
/** Design §3: ended / live / empty / draft / scheduled. */
export type WeekStatus = 'ended' | 'live' | 'empty' | 'draft' | 'scheduled'

export interface LessonSummary {
  id: number
  type: LessonType
  title: string
  cover_url: string | null
  status: 'draft' | 'published' | 'archived'
  cards_count: number
  week_start: string | null
  week_status: WeekTime
  author: { id: string; name: string | null; avatar_url: string | null } | null
  created_at: string
  updated_at: string
}

export interface WeekRow {
  week_start: string
  week_status: WeekTime
  status: WeekStatus
  lesson: LessonSummary | null
  questions_count: number
  /** Monday → Sunday: the day has a question. */
  question_days: boolean[]
}

export interface WeeksNeedingWork {
  count: number
  next_week_start: string | null
  last_planned_week_start: string | null
}

export interface DashboardDay {
  date: string
  today: boolean
  question: {
    id: number
    type: string
    prompt: string
    has_audio: boolean
    lesson_card_id: number | null
  } | null
  answers: number
  correct: number
  percent_correct: number | null
}

export interface WeekDashboard {
  week_start: string
  /** 1–7 for the live week, else null. */
  day: number | null
  status: WeekStatus
  lesson: LessonSummary | null
  stats: {
    started: number
    finished: number
    answers: number
    correct: number
    average_correct: number | null
  }
  drop_off: { card_id: number; position: number; label: string | null; heading: string | null; reached: number }[]
  days: DashboardDay[]
}

export const weekKeys = {
  all: ['weeks'] as const,
  dashboard: (weekStart: string | null) => ['weeks', 'dashboard', weekStart] as const,
  list: (from: string, to: string) => ['weeks', 'list', from, to] as const,
  needingWork: ['weeks', 'needing-work'] as const,
}

/** "This week" (default: the live week). */
export function useWeekDashboard(weekStart: string | null = null) {
  return useQuery({
    queryKey: weekKeys.dashboard(weekStart),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_week_dashboard', {
        p_week_start: weekStart ?? undefined,
      })
      if (error) throw error
      return data as unknown as WeekDashboard
    },
    refetchInterval: 60_000, // live numbers
  })
}

/** Weeks from `from` to `to` (Mondays), oldest first. */
export function useLessonWeeks(from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: weekKeys.list(from, to),
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_lesson_weeks', { p_from: from, p_to: to })
      if (error) throw error
      return data as unknown as WeekRow[]
    },
  })
}

/** Sidebar badge + "Next week needing work". */
export function useWeeksNeedingWork() {
  return useQuery({
    queryKey: weekKeys.needingWork,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_weeks_needing_work')
      if (error) throw error
      return data as unknown as WeeksNeedingWork
    },
  })
}
