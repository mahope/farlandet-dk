import React, { createContext, useContext, useEffect, useState } from 'react'

import { supabase, tables } from '../lib/supabase'
import type { AuthContextType, AuthState, AuthUser, UserProfile } from '../types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    initialized: false,
  })

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setState(prev => ({ ...prev, loading: false, initialized: true }))
          }
          return
        }

        if (session?.user && mounted) {
          const profile = await fetchUserProfile(session.user.id)
          setState({
            user: session.user as AuthUser,
            profile,
            session,
            loading: false,
            initialized: true,
          })
        } else if (mounted) {
          setState(prev => ({ ...prev, loading: false, initialized: true }))
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setState(prev => ({ ...prev, loading: false, initialized: true }))
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfile(session.user.id)
          setState({
            user: session.user as AuthUser,
            profile,
            session,
            loading: false,
            initialized: true,
          })
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            initialized: true,
          })
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setState(prev => ({
            ...prev,
            session,
            user: session.user as AuthUser,
          }))
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await tables.user_profiles()
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  async function signUp(email: string, password: string, username?: string): Promise<void> {
    try {
      setState(prev => ({ ...prev, loading: true }))

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || null,
          },
        },
      })

      if (error) {
        throw new AuthError(error.message, error.message)
      }

      // Profile will be created via database trigger
      // Auth state will be updated via onAuthStateChange
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }))
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Failed to sign up')
    }
  }

  async function signIn(email: string, password: string): Promise<void> {
    try {
      setState(prev => ({ ...prev, loading: true }))

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new AuthError(error.message, error.message)
      }

      // Auth state will be updated via onAuthStateChange
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }))
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Failed to sign in')
    }
  }

  async function signInWithProvider(provider: 'google' | 'facebook' | 'apple'): Promise<void> {
    try {
      setState(prev => ({ ...prev, loading: true }))

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw new AuthError(error.message, error.message)
      }

      // Auth state will be updated via onAuthStateChange after redirect
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }))
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError(`Failed to sign in with ${provider}`)
    }
  }

  async function signOut(): Promise<void> {
    try {
      setState(prev => ({ ...prev, loading: true }))

      const { error } = await supabase.auth.signOut()

      if (error) {
        throw new AuthError(error.message, error.message)
      }

      // Auth state will be updated via onAuthStateChange
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }))
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Failed to sign out')
    }
  }

  async function resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw new AuthError(error.message, error.message)
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Failed to send reset password email')
    }
  }

  async function updateProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!state.user) {
      throw new AuthError('User not authenticated')
    }

    try {
      const { error } = await tables.user_profiles()
        .update(updates)
        .eq('id', state.user.id)

      if (error) {
        throw new AuthError(error.message, error.message)
      }

      // Refetch profile
      const updatedProfile = await fetchUserProfile(state.user.id)
      setState(prev => ({ ...prev, profile: updatedProfile }))
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Failed to update profile')
    }
  }

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom AuthError class
class AuthError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}