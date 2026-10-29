import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
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
}

export interface Explanation {
  id: number
  user: { name: string | null; avatar_url: string | null }
  response: { option_ids?: string[]; text?: string; tile_ids?: string[] }
  is_correct: boolean
  explanation: string
  likes_count: number
  reports_count: number
  moderation_status: 'visible' | 'hidden' | 'approved'
  created_at: string
}

export const todayKeys = {
  today: ['today'] as const,
  explanations: (questionId: number) => ['today', 'explanations', questionId] as const,
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

export function useExplanations(questionId: number | null) {
  return useQuery({
    queryKey: todayKeys.explanations(questionId ?? 0),
    enabled: questionId != null,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_explanations', {
        p_question_id: questionId!,
      })
      if (error) throw error
      return data as unknown as Explanation[]
    },
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
