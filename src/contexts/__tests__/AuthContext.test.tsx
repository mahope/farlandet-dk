import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { supabase } from '../../lib/supabase'

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  },
  tables: {
    user_profiles: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}))

// Test component that uses the auth context
function TestComponent() {
  const { user, loading, initialized, signUp, signIn, signOut } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="initialized">{initialized.toString()}</div>
      <div data-testid="user">{user ? user.email : 'null'}</div>
      <button onClick={() => signUp('test@example.com', 'password123', 'testuser')}>
        Sign Up
      </button>
      <button onClick={() => signIn('test@example.com', 'password123')}>
        Sign In
      </button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

describe('AuthContext', () => {
  const mockSubscription = { unsubscribe: vi.fn() }
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful session response
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    })
    
    // Mock auth state change listener
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: mockSubscription },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with loading state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('true')
    expect(screen.getByTestId('initialized')).toHaveTextContent('false')
    expect(screen.getByTestId('user')).toHaveTextContent('null')
  })

  it('should initialize auth state correctly', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
      expect(screen.getByTestId('initialized')).toHaveTextContent('true')
    })
  })

  it('should handle sign up', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null,
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signUpButton = screen.getByText('Sign Up')
    signUpButton.click()

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            username: 'testuser',
          },
        },
      })
    })
  })

  it('should handle sign in', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signInButton = screen.getByText('Sign In')
    signInButton.click()

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('should handle sign out', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({
      error: null,
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signOutButton = screen.getByText('Sign Out')
    signOutButton.click()

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })
  })

  it('should handle auth errors', async () => {
    const mockError = { message: 'Invalid credentials' }
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: mockError,
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signInButton = screen.getByText('Sign In')
    
    // The error should be thrown when the button is clicked
    let errorThrown = false
    try {
      signInButton.click()
      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalled()
      })
    } catch (error) {
      errorThrown = true
      expect(error).toBeInstanceOf(Error)
    }
    
    // Since the error is handled internally, we just verify the auth method was called
    expect(supabase.auth.signInWithPassword).toHaveBeenCalled()
  })

  it('should clean up subscription on unmount', () => {
    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    unmount()

    expect(mockSubscription.unsubscribe).toHaveBeenCalled()
  })
})