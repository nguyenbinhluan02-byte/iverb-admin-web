import { createContext } from 'react'
import type { Me } from '@/services/me'

// error = signed in, but api.get_me failed (shown on the login page).
export type AuthStatus = 'loading' | 'signed-out' | 'not-admin' | 'admin' | 'error'

export interface AuthState {
  status: AuthStatus
  me: Me | null
  error: unknown
  retry: () => void
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)
