import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Header } from '../Header'
import { useAuth } from '../../../contexts/AuthContext'

// Mock the auth context
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

const mockUseAuth = vi.mocked(useAuth)

describe('Header', () => {
  const mockOnAuthModalOpen = vi.fn()
  const mockOnSearchChange = vi.fn()
  const mockSignOut = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders header with logo', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      signOut: mockSignOut,
      signIn: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn()
    })

    render(<Header onAuthModalOpen={mockOnAuthModalOpen} />)
    
    expect(screen.getByText('Danish Fathers Directory')).toBeInTheDocument()
  })

  it('shows search bar on desktop and mobile', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      signOut: mockSignOut,
      signIn: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn()
    })

    render(<Header onSearchChange={mockOnSearchChange} />)
    
    const searchInputs = screen.getAllByPlaceholderText('Søg efter ressourcer...')
    expect(searchInputs).toHaveLength(2) // Desktop and mobile versions
  })

  it('calls onSearchChange when typing in search bar', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      signOut: mockSignOut,
      signIn: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn()
    })

    render(<Header onSearchChange={mockOnSearchChange} />)
    
    const searchInput = screen.getAllByPlaceholderText('Søg efter ressourcer...')[0]
    fireEvent.change(searchInput, { target: { value: 'test search' } })
    
    expect(mockOnSearchChange).toHaveBeenCalledWith('test search')
  })

  it('shows login button when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      signOut: mockSignOut,
      signIn: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn()
    })

    render(<Header onAuthModalOpen={mockOnAuthModalOpen} />)
    
    expect(screen.getByText('Log ind')).toBeInTheDocument()
  })

  it('calls onAuthModalOpen when login button is clicked', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      signOut: mockSignOut,
      signIn: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn()
    })

    render(<Header onAuthModalOpen={mockOnAuthModalOpen} />)
    
    fireEvent.click(screen.getByText('Log ind'))
    expect(mockOnAuthModalOpen).toHaveBeenCalled()
  })

  it('shows user info and logout button when authenticated', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      app_metadata: {},
      user_metadata: {}
    }

    const mockProfile = {
      id: '1',
      username: 'testuser',
      role: 'user' as const,
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    }

    mockUseAuth.mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      loading: false,
      signOut: mockSignOut,
      signIn: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn()
    })

    render(<Header />)
    
    expect(screen.getByText('testuser')).toBeInTheDocument()
    expect(screen.getByText('Log ud')).toBeInTheDocument()
  })

  it('calls signOut when logout button is clicked', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      app_metadata: {},
      user_metadata: {}
    }

    mockUseAuth.mockReturnValue({
      user: mockUser,
      profile: null,
      loading: false,
      signOut: mockSignOut,
      signIn: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn()
    })

    render(<Header />)
    
    fireEvent.click(screen.getByText('Log ud'))
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  it('toggles mobile menu when menu button is clicked', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      signOut: mockSignOut,
      signIn: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn()
    })

    render(<Header onAuthModalOpen={mockOnAuthModalOpen} />)
    
    // Find menu button (should be hidden on desktop, visible on mobile)
    const menuButton = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(menuButton)
    
    // Mobile menu should now be visible
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('shows email prefix as username when no username is set', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      app_metadata: {},
      user_metadata: {}
    }

    mockUseAuth.mockReturnValue({
      user: mockUser,
      profile: null,
      loading: false,
      signOut: mockSignOut,
      signIn: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn()
    })

    render(<Header />)
    
    expect(screen.getByText('test')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      signOut: mockSignOut,
      signIn: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn()
    })

    const { container } = render(<Header className="custom-class" />)
    
    expect(container.firstChild).toHaveClass('custom-class')
  })
})