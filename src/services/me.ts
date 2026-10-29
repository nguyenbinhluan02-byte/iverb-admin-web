import { supabase } from '@/lib/supabase'

export interface Me {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
}

// api.get_me() → { profile, access, ... }; the admin web only needs the profile.
export async function getMe(): Promise<Me | null> {
  const { data, error } = await supabase.rpc('get_me')
  if (error) throw error
  return (data as { profile: Me | null } | null)?.profile ?? null
}
