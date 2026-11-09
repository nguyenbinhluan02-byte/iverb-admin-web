import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// api.admin_get_app_config / api.admin_save_app_config (iverb-supabase TASK-060).

export interface AppConfig {
  lesson_interstitial_every: number
  verb_detail_interstitial_every: number
  answer_trial_days: number
  lesson_preview_cards: number
  privacy_url: string
  terms_url: string
}

export type AppConfigKey = keyof AppConfig

export const appConfigKeys = { all: ['app-config'] as const }

export function useAppConfig() {
  return useQuery({
    queryKey: appConfigKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_app_config')
      if (error) throw error
      return data as unknown as AppConfig
    },
  })
}

/** Saves only the changed keys in one call; the server checks every value. */
export function useSaveAppConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: Partial<AppConfig>) => {
      const { data, error } = await supabase.rpc('admin_save_app_config', { p_values: values })
      if (error) throw error
      return data as unknown as AppConfig
    },
    onSuccess: (data) => queryClient.setQueryData(appConfigKeys.all, data),
  })
}
