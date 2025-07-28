// PocketBase Authentication Types

import type { User } from './pocketbase'

export interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, passwordConfirm: string, username?: string) => Promise<void>
  signOut: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  isModerator: boolean
}

export interface SignInFormData {
  email: string
  password: string
}

export interface SignUpFormData {
  email: string
  password: string
  passwordConfirm: string
  username?: string
}

export interface ResetPasswordFormData {
  email: string
}

export interface UpdateProfileFormData {
  username?: string
  email?: string
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}