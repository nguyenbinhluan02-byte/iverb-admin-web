import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type PushStatus = 'sending' | 'sent' | 'failed'

export interface Push {
  id: number
  title: string
  body: string
  status: PushStatus
  error: string | null
  sent_by: { name: string | null } | null
  created_at: string
}

export type PushErrorCode =
  'unauthorized' | 'not_admin' | 'invalid_push' | 'send_failed' | 'not_configured'

/** Error from the `admin-push` Edge Function, with the `{ error }` code of its body. */
export class PushError extends Error {
  code: string
  constructor(code: string) {
    super(code)
    this.code = code
  }
}

export const pushKeys = { list: ['pushes'] as const }

/** Pushes sent by admins, newest first (api.admin_list_pushes). */
export function usePushes() {
  return useQuery({
    queryKey: pushKeys.list,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_pushes', { p_limit: 50 })
      if (error) throw error
      return (data ?? []) as unknown as Push[]
    },
  })
}

/** Reads `{ error: code }` from a non-2xx Edge Function response (FunctionsHttpError.context). */
async function errorCode(error: unknown): Promise<string> {
  const response = (error as { context?: unknown })?.context
  if (response instanceof Response) {
    try {
      const body = (await response.clone().json()) as { error?: unknown }
      if (typeof body?.error === 'string') return body.error
    } catch {
      // not JSON
    }
  }
  return error instanceof Error ? error.message : String(error)
}

/** Sends a push to every app user (Edge Function `admin-push`). */
export function useSendPush() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (push: { title: string; body: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-push', { body: push })
      if (error) throw new PushError(await errorCode(error))
      return data as { id: number; status: 'sent' }
    },
    // Failed sends are recorded too, so refresh either way.
    onSettled: () => queryClient.invalidateQueries({ queryKey: pushKeys.list }),
  })
}
