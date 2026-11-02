import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// api.admin_list_users / api.admin_get_user (iverb-supabase TASK-039, admin-api.md → Users).

/** trial: no premium in use, free answer trial not over (iverb-supabase TASK-042). */
export type UserStatus = 'active' | 'trial' | 'expired' | 'free'
export type UserPlan = 'yearly' | 'lifetime' | 'gift' | 'manual'
export type Provider = 'google' | 'apple' | 'email'

export type StatusFilter = 'all' | UserStatus
export type PlanFilter = 'all' | 'premium' | 'gift' | 'none'
export type ProviderFilter = 'all' | Provider
export type UserSort = 'recent' | 'newest' | 'oldest' | 'name'

export interface AdminUser {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  provider: Provider
  status: UserStatus
  /** null = never had premium. */
  plan: UserPlan | null
  /** Active: when it ends (null = lifetime). Expired: when it ended. */
  plan_expires_at: string | null
  /** End of the free answer trial, also when over; null = none. */
  trial_expires_at: string | null
  joined_at: string
  last_active_at: string | null
}

export interface UserStats {
  answered: number
  /** null until the first answer. */
  accuracy_pct: number | null
  streak_days: number
  community_answers: number
  submissions: number
  reports_received: number
}

export interface UserDetail extends AdminUser {
  stats: UserStats
}

export interface UserFilters {
  query: string
  status: StatusFilter
  plan: PlanFilter
  /** 'YYYY-MM' or '' for any month. */
  joined: string
  provider: ProviderFilter
  sort: UserSort
}

export interface UserCounts {
  status: Record<StatusFilter, number>
  plan: Record<PlanFilter, number>
  provider: Record<ProviderFilter, number>
}

export interface UserPage {
  items: AdminUser[]
  total: number
  page: number
  page_size: number
  counts: UserCounts
  first_joined_at: string | null
}

export const USERS_PAGE_SIZE = 12

export const userKeys = {
  all: ['users'] as const,
  page: (f: UserFilters, page: number) => [...userKeys.all, 'page', f, page] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
}

export function useUserPage(filters: UserFilters, page: number) {
  return useQuery({
    queryKey: userKeys.page(filters, page),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_users', {
        p_query: filters.query.trim() || undefined,
        p_status: filters.status,
        p_plan: filters.plan,
        p_joined_month: filters.joined || undefined,
        p_provider: filters.provider,
        p_sort: filters.sort,
        p_page: page,
        p_page_size: USERS_PAGE_SIZE,
      })
      if (error) throw error
      return data as unknown as UserPage
    },
    placeholderData: keepPreviousData,
  })
}

export function useUserDetail(id: string | null) {
  return useQuery({
    queryKey: userKeys.detail(id ?? ''),
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_user', { p_id: id! })
      if (error) throw error
      return data as unknown as UserDetail
    },
  })
}
