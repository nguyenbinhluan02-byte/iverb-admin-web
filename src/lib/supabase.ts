import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/services/database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (see .env.example)')
}

// The app only calls RPCs in the `api` schema.
export const supabase = createClient<Database, 'api'>(url, anonKey, {
  db: { schema: 'api' },
})
