import React, { createContext, useContext, useEffect, useState } from 'react'
import { pb, PocketBaseAPI, type UserRecord } from '../lib/pocketbase'
import type { User } from '../types/pocketbase'
import type { RecordModel } from 'pocketbase'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, passwordConfirm: string, username?: string) => Promise<void>
  signOut: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  isModerator: boolean
}

// Helper function to map UserRecord to User
function mapUserRecordToUser(record: UserRecord): User {
  return {
    id: record.id,
    email: record.email,
    username: record.username,
    role: record.role,
    emailVisibility: record.emailVisibility,
    verified: record.verified,
    created: record.created,
    updated: record.updated,
  }
}

// Helper function to map RecordModel to User  
function mapRecordToUser(record: RecordModel): User {
  return {
    id: record.id,
    email: record.email,
    username: record.username,
    role: (record as any).role || 'user',
    emailVisibility: (record as any).emailVisibility,
    verified: (record as any).verified,
    created: record.created,
    updated: record.updated,
  }
}

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
    loading: true,
    initialized: false,
  })

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    function initializeAuth() {
      try {
        // Get current auth state from PocketBase
        const currentUser = PocketBaseAPI.getCurrentUser()
        
        if (mounted) {
          setState({
            user: currentUser ? mapUserRecordToUser(currentUser) : null,
            loading: false,
            initialized: true,
          })
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setState({
            user: null,
            loading: false,
            initialized: true,
          })
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange((_token, model) => {
      if (!mounted) return
      
      setState(prev => ({
        ...prev,
        user: model ? mapRecordToUser(model) : null,
        loading: false,
        initialized: true,
      }))
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  async function signIn(email: string, password: string): Promise<void> {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      const authData = await PocketBaseAPI.signIn(email, password)
      
      setState(prev => ({
        ...prev,
        user: mapRecordToUser(authData.record),
        loading: false,
      }))
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }))
      
      // Re-throw error for component handling
      if (error instanceof Error) {
        throw new AuthError(error.message)
      }
      throw new AuthError('Failed to sign in')
    }
  }

  async function signUp(
    email: string, 
    password: string, 
    passwordConfirm: string, 
    username?: string
  ): Promise<void> {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      await PocketBaseAPI.signUp(email, password, passwordConfirm, username)
      
      // After signup, user needs to sign in (depending on PocketBase config)
      const authData = await PocketBaseAPI.signIn(email, password)
      
      setState(prev => ({
        ...prev,
        user: mapRecordToUser(authData.record),
        loading: false,
      }))
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }))
      
      if (error instanceof Error) {
        throw new AuthError(error.message)
      }
      throw new AuthError('Failed to sign up')
    }
  }

  function signOut(): void {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      PocketBaseAPI.signOut()
      
      setState({
        user: null,
        loading: false,
        initialized: true,
      })
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }))
      console.error('Error signing out:', error)
    }
  }

  async function updateProfile(updates: Partial<User>): Promise<void> {
    if (!state.user) {
      throw new AuthError('User not authenticated')
    }

    try {
      const updatedUser = await pb.collection('users').update(state.user.id, updates)
      
      setState(prev => ({
        ...prev,
        user: mapRecordToUser(updatedUser),
      }))
    } catch (error) {
      if (error instanceof Error) {
        throw new AuthError(error.message)
      }
      throw new AuthError('Failed to update profile')
    }
  }

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: PocketBaseAPI.isAuthenticated(),
    isAdmin: state.user?.role === 'admin',
    isModerator: state.user?.role === 'moderator' || state.user?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom AuthError class
class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}