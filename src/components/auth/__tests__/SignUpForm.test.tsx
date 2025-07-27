import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignUpForm } from '../SignUpForm'

// Mock the auth context
const mockSignUp = vi.fn()
const mockAuthContext = {
  user: null,
  profile: null,
  session: null,
  loading: false,
  initialized: true,
  signUp: mockSignUp,
  signIn: vi.fn(),
  signInWithProvider: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  updateProfile: vi.fn(),
}

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockAuthContext,
}))

describe('SignUpForm', () => {
  const user = userEvent.setup()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render sign up form', () => {
    render(<SignUpForm />)
    
    expect(screen.getByText('Opret konto')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Brugernavn (valgfrit)')).toBeInTheDocument()
    expect(screen.getByLabelText('Adgangskode')).toBeInTheDocument()
    expect(screen.getByLabelText('Bekræft adgangskode')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Opret konto' })).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    render(<SignUpForm />)
    
    const submitButton = screen.getByRole('button', { name: 'Opret konto' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email er påkrævet')).toBeInTheDocument()
      expect(screen.getByText('Adgangskode skal være mindst 8 tegn')).toBeInTheDocument()
      expect(screen.getByText('Bekræft adgangskode er påkrævet')).toBeInTheDocument()
    })
  })

  it('should validate email format', async () => {
    render(<SignUpForm />)
    
    const emailInput = screen.getByLabelText('Email')
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: 'Opret konto' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Ugyldig email adresse')).toBeInTheDocument()
    })
  })

  it('should validate password requirements', async () => {
    render(<SignUpForm />)
    
    const passwordInput = screen.getByLabelText('Adgangskode')
    await user.type(passwordInput, 'weak')
    
    const submitButton = screen.getByRole('button', { name: 'Opret konto' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Adgangskode skal være mindst 8 tegn')).toBeInTheDocument()
    })
  })

  it('should validate password confirmation', async () => {
    render(<SignUpForm />)
    
    const passwordInput = screen.getByLabelText('Adgangskode')
    const confirmPasswordInput = screen.getByLabelText('Bekræft adgangskode')
    
    await user.type(passwordInput, 'Password123')
    await user.type(confirmPasswordInput, 'DifferentPassword123')
    
    const submitButton = screen.getByRole('button', { name: 'Opret konto' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Adgangskoder matcher ikke')).toBeInTheDocument()
    })
  })

  it('should validate username format', async () => {
    render(<SignUpForm />)
    
    const usernameInput = screen.getByLabelText('Brugernavn (valgfrit)')
    await user.type(usernameInput, 'invalid username!')
    
    const submitButton = screen.getByRole('button', { name: 'Opret konto' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Brugernavn må kun indeholde bogstaver, tal, _ og -')).toBeInTheDocument()
    })
  })

  it('should submit form with valid data', async () => {
    const onSuccess = vi.fn()
    mockSignUp.mockResolvedValue(undefined)
    
    render(<SignUpForm onSuccess={onSuccess} />)
    
    const emailInput = screen.getByLabelText('Email')
    const usernameInput = screen.getByLabelText('Brugernavn (valgfrit)')
    const passwordInput = screen.getByLabelText('Adgangskode')
    const confirmPasswordInput = screen.getByLabelText('Bekræft adgangskode')
    const submitButton = screen.getByRole('button', { name: 'Opret konto' })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'Password123')
    await user.type(confirmPasswordInput, 'Password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'Password123', 'testuser')
    })
  })

  it('should submit form without username', async () => {
    const onSuccess = vi.fn()
    mockSignUp.mockResolvedValue(undefined)
    
    render(<SignUpForm onSuccess={onSuccess} />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Adgangskode')
    const confirmPasswordInput = screen.getByLabelText('Bekræft adgangskode')
    const submitButton = screen.getByRole('button', { name: 'Opret konto' })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'Password123')
    await user.type(confirmPasswordInput, 'Password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'Password123', undefined)
    })
  })

  it('should handle sign up error', async () => {
    const error = new Error('Email already exists')
    mockSignUp.mockRejectedValue(error)
    
    render(<SignUpForm />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Adgangskode')
    const confirmPasswordInput = screen.getByLabelText('Bekræft adgangskode')
    const submitButton = screen.getByRole('button', { name: 'Opret konto' })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'Password123')
    await user.type(confirmPasswordInput, 'Password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
  })

  it('should call onSwitchToSignIn when link is clicked', async () => {
    const onSwitchToSignIn = vi.fn()
    
    render(<SignUpForm onSwitchToSignIn={onSwitchToSignIn} />)
    
    const signInLink = screen.getByText('Log ind')
    await user.click(signInLink)
    
    expect(onSwitchToSignIn).toHaveBeenCalled()
  })
})