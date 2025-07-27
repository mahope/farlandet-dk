import type { User, Session } from '@supabase/supabase-js'
import type { Database } from './database'

// Auth types
export interface AuthUser extends User {}

export interface UserProfile {
  id: string
  username: string | null
  role: Database['public']['Enums']['user_role']
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  initialized: boolean
}

export interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, username?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithProvider: (provider: 'google' | 'facebook' | 'apple') => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

// Form types
export interface SignUpFormData {
  email: string
  password: string
  confirmPassword: string
  username?: string
}

export interface SignInFormData {
  email: string
  password: string
}

export interface ResetPasswordFormData {
  email: string
}

// Error types
export interface AuthError {
  message: string
  code?: string
}