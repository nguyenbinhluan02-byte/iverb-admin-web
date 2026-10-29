import type { Session } from '@supabase/supabase-js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { getMe } from '@/services/me'
import { AuthContext, type AuthState, type AuthStatus } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  // undefined = session not restored yet.
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id
  const meQuery = useQuery({
    queryKey: ['me', userId],
    queryFn: getMe,
    enabled: !!userId,
    staleTime: Infinity,
  })

  let status: AuthStatus
  if (session === undefined || (userId && meQuery.isPending)) status = 'loading'
  else if (!userId) status = 'signed-out'
  else if (meQuery.isError) status = 'error'
  else status = meQuery.data?.role === 'admin' ? 'admin' : 'not-admin'

  const value: AuthState = {
    status,
    me: meQuery.data ?? null,
    error: meQuery.error,
    retry: () => void meQuery.refetch(),
    async signIn(email, password) {
      // A failed get_me is cached per user (staleTime: Infinity): drop it so
      // signing in again asks the server again.
      queryClient.removeQueries({ queryKey: ['me'] })
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    async signOut() {
      await supabase.auth.signOut()
      queryClient.clear()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
