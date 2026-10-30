import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Json } from './database.types'

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
  explanation: string | null
  status: QuestionStatus
  date: string | null // YYYY-MM-DD (UTC day)
  /** name = "Shown as author" override or the profile name */
  author: { id: string | null; name: string | null; role: 'admin' | 'user' } | null
  author_name: string | null
  /** Users answered it: type / content / answer key are locked. */
  has_answers: boolean
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
  search: (params: SearchParams) => ['questions', 'search', params] as const,
  page: (params: SearchParams, page: number) => ['questions', 'page', params, page] as const,
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

export type SearchStatus = 'all' | 'published' | 'unpublished' | 'upcoming' | 'draft'
export type SearchSource = 'all' | 'admin' | 'user'

export interface SearchParams {
  query: string
  status: SearchStatus
  source: SearchSource
  type: 'all' | QType
  sort: 'newest' | 'oldest'
  /** Only questions that can go on an empty day (Choose from library). */
  pickable?: boolean
}

export interface SearchCounts {
  status: Record<SearchStatus, number>
  sources: Record<SearchSource, number>
}

interface SearchPage {
  items: Question[]
  next_cursor: Json | null
  total: number
  counts: SearchCounts
}

const SEARCH_PAGE_SIZE = 30
export const LIBRARY_PAGE_SIZE = 8

const searchArgs = (params: SearchParams) => ({
  p_query: params.query.trim() || undefined,
  p_status: params.status,
  p_source: params.source,
  p_type: params.type === 'all' ? undefined : params.type,
  p_sort: params.sort,
  p_pickable: params.pickable ?? false,
})

/** One numbered page of the library (1-based), api.admin_search_questions + p_offset. */
export function useQuestionPage(params: SearchParams, page: number) {
  return useQuery({
    queryKey: questionKeys.page(params, page),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_search_questions', {
        ...searchArgs(params),
        p_limit: LIBRARY_PAGE_SIZE,
        p_offset: (page - 1) * LIBRARY_PAGE_SIZE,
      })
      if (error) throw error
      return data as unknown as SearchPage
    },
    placeholderData: keepPreviousData,
  })
}

/** Server-side filtered questions, cursor paged for Load more (Choose from library). */
export function useQuestionSearch(params: SearchParams) {
  return useInfiniteQuery({
    queryKey: questionKeys.search(params),
    initialPageParam: null as Json | null,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase.rpc('admin_search_questions', {
        ...searchArgs(params),
        p_limit: SEARCH_PAGE_SIZE,
        p_cursor: pageParam ?? undefined,
      })
      if (error) throw error
      return data as unknown as SearchPage
    },
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    placeholderData: keepPreviousData,
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

export interface SaveQuestionInput {
  id: number | null
  type: QType
  prompt: string
  content: QuestionContent
  answer_key: AnswerKey | null
  explanation: string
  author_name: string
  date: string | null
  publish: boolean
}

export function useSaveQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: SaveQuestionInput) => {
      const { data, error } = await supabase.rpc('admin_save_question', {
        p_id: input.id as number,
        p_type: input.type,
        p_prompt: input.prompt,
        p_content: input.content as Json,
        p_answer_key: input.answer_key as Json,
        p_explanation: input.explanation,
        p_author_name: input.author_name,
        p_date: input.date as string,
        p_publish: input.publish,
      })
      if (error) throw error
      return data as unknown as Question
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: questionKeys.all }),
  })
}

/** Put a library question on an empty day: shown → copied, otherwise moved. */
export function useScheduleQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, date }: { id: number; date: string }) => {
      const { data, error } = await supabase.rpc('admin_schedule_question', {
        p_question_id: id,
        p_date: date,
      })
      if (error) throw error
      return data as unknown as Question
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: questionKeys.all }),
  })
}
