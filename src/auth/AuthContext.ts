import { createContext } from 'react'
import type { Me } from '@/services/me'

export type AuthStatus = 'loading' | 'signed-out' | 'not-admin' | 'admin'

export interface AuthState {
  status: AuthStatus
  me: Me | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)
