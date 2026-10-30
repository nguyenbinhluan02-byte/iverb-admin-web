import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Json } from './database.types'
import type { Question } from './questions'

export interface TodayStats {
  answers_count: number
  correct_count: number
  option_votes: Record<string, number>
}

export interface Today {
  date: string
  question: Question | null
  stats: TodayStats
  explanations_count: number
  /** Explanations with reports on them or on one of their replies (TASK-029). */
  reported_count: number
}

export type ReportReason = 'spam' | 'misleading' | 'offensive' | 'harassment' | 'other'

/** Most frequent reason wins (api report_summary). */
export interface Reports {
  count: number
  top_reason: ReportReason | null
}

export type ModerationStatus = 'visible' | 'hidden' | 'approved'

export interface Explanation {
  id: number
  user: { name: string | null; avatar_url: string | null }
  response: { option_ids?: string[]; text?: string; tile_ids?: string[] }
  is_correct: boolean
  explanation: string
  likes_count: number
  reports_count: number
  replies_count: number
  reports: Reports
  reported_replies_count: number
  /** hidden = auto-hidden from app users after enough reports. */
  moderation_status: ModerationStatus
  created_at: string
}

export interface Reply {
  id: number
  user: { name: string | null; avatar_url: string | null }
  text: string
  moderation_status: ModerationStatus
  reports: Reports
  created_at: string
}

export type ExplanationFilter = 'all' | 'reported'

export const todayKeys = {
  today: ['today'] as const,
  explanations: (questionId: number, filter: ExplanationFilter) =>
    ['today', 'explanations', questionId, filter] as const,
  replies: (answerId: number) => ['today', 'replies', answerId] as const,
}

export function useToday() {
  return useQuery({
    queryKey: todayKeys.today,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_today')
      if (error) throw error
      return data as unknown as Today
    },
    refetchInterval: 60_000, // live numbers
  })
}

const EXPLANATIONS_PAGE_SIZE = 20

/** Newest first, cursor paged, filtered on the server (api.admin_explanations_page). */
export function useExplanations(questionId: number | null, filter: ExplanationFilter = 'all') {
  return useInfiniteQuery({
    queryKey: todayKeys.explanations(questionId ?? 0, filter),
    enabled: questionId != null,
    initialPageParam: null as Json | null,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase.rpc('admin_explanations_page', {
        p_question_id: questionId!,
        p_limit: EXPLANATIONS_PAGE_SIZE,
        p_cursor: pageParam ?? undefined,
        p_filter: filter,
      })
      if (error) throw error
      return data as unknown as { items: Explanation[]; next_cursor: Json | null }
    },
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    refetchInterval: 60_000,
  })
}

export function useRemoveExplanation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (answerId: number) => {
      const { error } = await supabase.rpc('admin_remove_explanation', { p_answer_id: answerId })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todayKeys.today }),
  })
}

const REPLIES_PAGE_SIZE = 20

/** Replies of an explanation, oldest first, cursor paged (api.admin_replies_page). */
export function useReplies(answerId: number, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: todayKeys.replies(answerId),
    enabled,
    initialPageParam: null as Json | null,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase.rpc('admin_replies_page', {
        p_answer_id: answerId,
        p_limit: REPLIES_PAGE_SIZE,
        p_cursor: pageParam ?? undefined,
      })
      if (error) throw error
      return data as unknown as { items: Reply[]; next_cursor: Json | null }
    },
    getNextPageParam: (last) => last.next_cursor ?? undefined,
  })
}

/** Deletes a reply for good (api.admin_delete_reply). */
export function useDeleteReply() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ replyId }: { replyId: number; answerId: number }) => {
      const { error } = await supabase.rpc('admin_delete_reply', { p_reply_id: replyId })
      if (error) throw error
    },
    // Everything under 'today': replies, replies_count / reported_replies_count, reported_count.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todayKeys.today }),
  })
}

/** Clears the reports of a post and shows it again (api.admin_dismiss_reports). */
export function useDismissReports() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ type, id }: { type: 'answer' | 'reply'; id: number }) => {
      const { error } = await supabase.rpc('admin_dismiss_reports', {
        p_target_type: type,
        p_target_id: id,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todayKeys.today }),
  })
}
