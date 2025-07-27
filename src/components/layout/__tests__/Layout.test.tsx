import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Layout } from '../Layout'
import { useAuth } from '../../../contexts/AuthContext'

// Mock the auth context
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

const mockUseAuth = vi.mocked(useAuth)

describe('Layout', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      signOut: vi.fn(),
      signIn: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn()
    })
  })

  it('renders children content', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders header by default', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    expect(screen.getByText('Danish Fathers Directory')).toBeInTheDocument()
  })

  it('renders footer by default', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    expect(screen.getByText('Om Danish Fathers Directory')).toBeInTheDocument()
  })

  it('hides header when showHeader is false', () => {
    render(
      <Layout showHeader={false}>
        <div>Content</div>
      </Layout>
    )
    
    expect(screen.queryByText('Danish Fathers Directory')).not.toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('hides footer when showFooter is false', () => {
    render(
      <Layout showFooter={false}>
        <div>Content</div>
      </Layout>
    )
    
    expect(screen.queryByText('Om Danish Fathers Directory')).not.toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('passes onAuthModalOpen to header', () => {
    const mockOnAuthModalOpen = vi.fn()
    
    render(
      <Layout onAuthModalOpen={mockOnAuthModalOpen}>
        <div>Content</div>
      </Layout>
    )
    
    // Header should receive the prop (tested in Header tests)
    expect(screen.getByText('Log ind')).toBeInTheDocument()
  })

  it('passes onSearchChange to header', () => {
    const mockOnSearchChange = vi.fn()
    
    render(
      <Layout onSearchChange={mockOnSearchChange}>
        <div>Content</div>
      </Layout>
    )
    
    // Search inputs should be present (tested in Header tests)
    expect(screen.getAllByPlaceholderText('Søg efter ressourcer...')).toHaveLength(2)
  })

  it('applies custom className to main content', () => {
    const { container } = render(
      <Layout className="custom-main-class">
        <div>Content</div>
      </Layout>
    )
    
    const mainElement = container.querySelector('main')
    expect(mainElement).toHaveClass('custom-main-class')
  })

  it('has proper layout structure', () => {
    const { container } = render(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    const layoutContainer = container.firstChild
    expect(layoutContainer).toHaveClass('min-h-screen', 'flex', 'flex-col', 'bg-background')
    
    const mainElement = container.querySelector('main')
    expect(mainElement).toHaveClass('flex-1', 'container', 'mx-auto', 'px-4', 'py-6')
  })

  it('renders without header and footer when both are disabled', () => {
    render(
      <Layout showHeader={false} showFooter={false}>
        <div>Standalone Content</div>
      </Layout>
    )
    
    expect(screen.getByText('Standalone Content')).toBeInTheDocument()
    expect(screen.queryByText('Danish Fathers Directory')).not.toBeInTheDocument()
    expect(screen.queryByText('Om Danish Fathers Directory')).not.toBeInTheDocument()
  })

  it('maintains responsive container classes', () => {
    const { container } = render(
      <Layout>
        <div>Content</div>
      </Layout>
    )
    
    const mainElement = container.querySelector('main')
    expect(mainElement).toHaveClass('container', 'mx-auto', 'px-4')
  })
})