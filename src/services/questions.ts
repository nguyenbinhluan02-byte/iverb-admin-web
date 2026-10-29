import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type QType = 'single' | 'multi' | 'fill' | 'order'
export type QuestionStatus = 'draft' | 'unscheduled' | 'published' | 'live' | 'scheduled'
export type UseStatus = 'shown' | 'live' | 'scheduled' | 'draft'

export interface Item {
  id: string
  text: string
}

export interface QuestionContent {
  options?: Item[] // single / multi
  before?: string // fill
  after?: string
  hint?: string
  tiles?: Item[] // order (shuffled)
}

export interface AnswerKey {
  correct?: string[] // single / multi: option ids
  accepted?: string[] // fill
  order?: string[] // order: tile ids
}

export interface Question {
  id: number
  type: QType
  prompt: string
  content: QuestionContent
  answer_key: AnswerKey | null
  status: QuestionStatus
  date: string | null // YYYY-MM-DD (UTC day)
  author: { id: string; name: string | null; role: 'admin' | 'user' } | null
  usage_count: number
  created_at: string
  updated_at: string
}

export interface QuestionUse {
  date: string
  question_id: number
  status: UseStatus
}

export const questionKeys = {
  all: ['questions'] as const,
  history: (id: number) => ['questions', id, 'history'] as const,
}

export function useQuestions() {
  return useQuery({
    queryKey: questionKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_questions')
      if (error) throw error
      return data as unknown as Question[]
    },
  })
}

export function useQuestionHistory(id: number | null) {
  return useQuery({
    queryKey: questionKeys.history(id ?? 0),
    enabled: id != null,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_question_history', { p_question_id: id! })
      if (error) throw error
      return (data as unknown as { uses: QuestionUse[] }).uses
    },
  })
}
