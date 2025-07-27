import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignInForm } from '../SignInForm'
import { AuthProvider } from '../../../contexts/AuthContext'

// Mock the auth context
const mockSignIn = vi.fn()
const mockAuthContext = {
  user: null,
  profile: null,
  session: null,
  loading: false,
  initialized: true,
  signUp: vi.fn(),
  signIn: mockSignIn,
  signInWithProvider: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  updateProfile: vi.fn(),
}

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockAuthContext,
}))

describe('SignInForm', () => {
  const user = userEvent.setup()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render sign in form', () => {
    render(<SignInForm />)
    
    expect(screen.getByText('Log ind')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Adgangskode')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log ind' })).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    render(<SignInForm />)
    
    const submitButton = screen.getByRole('button', { name: 'Log ind' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email er påkrævet')).toBeInTheDocument()
      expect(screen.getByText('Adgangskode er påkrævet')).toBeInTheDocument()
    })
  })

  it('should validate email format', async () => {
    render(<SignInForm />)
    
    const emailInput = screen.getByLabelText('Email')
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: 'Log ind' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Ugyldig email adresse')).toBeInTheDocument()
    })
  })

  it('should submit form with valid data', async () => {
    const onSuccess = vi.fn()
    mockSignIn.mockResolvedValue(undefined)
    
    render(<SignInForm onSuccess={onSuccess} />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Adgangskode')
    const submitButton = screen.getByRole('button', { name: 'Log ind' })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should handle sign in error', async () => {
    const error = new Error('Invalid credentials')
    mockSignIn.mockRejectedValue(error)
    
    render(<SignInForm />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Adgangskode')
    const submitButton = screen.getByRole('button', { name: 'Log ind' })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('should call onSwitchToSignUp when link is clicked', async () => {
    const onSwitchToSignUp = vi.fn()
    
    render(<SignInForm onSwitchToSignUp={onSwitchToSignUp} />)
    
    const signUpLink = screen.getByText('Opret konto')
    await user.click(signUpLink)
    
    expect(onSwitchToSignUp).toHaveBeenCalled()
  })

  it('should call onForgotPassword when link is clicked', async () => {
    const onForgotPassword = vi.fn()
    
    render(<SignInForm onForgotPassword={onForgotPassword} />)
    
    const forgotPasswordLink = screen.getByText('Glemt adgangskode?')
    await user.click(forgotPasswordLink)
    
    expect(onForgotPassword).toHaveBeenCalled()
  })

  it('should clear error when input changes', async () => {
    const error = new Error('Invalid credentials')
    mockSignIn.mockRejectedValue(error)
    
    render(<SignInForm />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Adgangskode')
    const submitButton = screen.getByRole('button', { name: 'Log ind' })
    
    // Trigger error
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
    
    // Clear error by typing
    await user.type(emailInput, 'a')
    
    await waitFor(() => {
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
    })
  })
})