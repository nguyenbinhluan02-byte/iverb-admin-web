import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Json } from '@/services/database.types'
import type { UserStatus } from '@/services/users'

export type PushStatus = 'sending' | 'sent' | 'failed'

export interface Push {
  id: number
  title: string
  body: string
  image_url: string | null
  /** null = every device on the `announcements` topic. */
  audience: Audience | null
  /** Token pushes: devices that got it / failed (null for topic pushes). */
  sent_count: number | null
  failed_count: number | null
  status: PushStatus
  error: string | null
  sent_by: { name: string | null } | null
  created_at: string
}

export type PushErrorCode =
  | 'unauthorized'
  | 'not_admin'
  | 'invalid_push'
  | 'invalid_audience'
  | 'no_recipients'
  | 'send_failed'
  | 'not_configured'

export type PushPlatform = 'android' | 'ios'

/**
 * Who gets a token push (signed-in users only, iverb-supabase TASK-062).
 * Missing / empty list = no filter; lists combine with AND.
 */
export interface Audience {
  versions?: string[]
  platforms?: PushPlatform[]
  statuses?: UserStatus[]
  user_ids?: string[]
}

export interface AudienceReach {
  users: number
  devices: number
  /** App versions that have a device token ('unknown' = not sent). */
  versions: { version: string; devices: number }[]
}

/** Error from the `admin-push` Edge Function, with the `{ error }` code of its body. */
export class PushError extends Error {
  code: string
  constructor(code: string) {
    super(code)
    this.code = code
  }
}

export const pushKeys = {
  list: ['pushes'] as const,
  audience: (a: Audience) => ['pushes', 'audience', a] as const,
}

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

/** How many users / devices an audience reaches (api.admin_push_audience). */
export function usePushAudience(audience: Audience, enabled = true) {
  return useQuery({
    queryKey: pushKeys.audience(audience),
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_push_audience', {
        p_audience: audience as Json,
      })
      if (error) throw error
      return data as unknown as AudienceReach
    },
    placeholderData: keepPreviousData,
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

export interface NewPush {
  title: string
  body: string
  /** Public picture (lesson-media); Android shows it, iOS not yet. */
  image_url?: string
  /** Omitted = all users (topic). */
  audience?: Audience
}

/** Sends a push to every app user (Edge Function `admin-push`). */
export function useSendPush() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (push: NewPush) => {
      const { data, error } = await supabase.functions.invoke('admin-push', { body: push })
      if (error) throw new PushError(await errorCode(error))
      return data as { id: number; status: 'sent'; sent?: number; failed?: number }
    },
    // Failed sends are recorded too, so refresh either way.
    onSettled: () => queryClient.invalidateQueries({ queryKey: pushKeys.list }),
  })
}
