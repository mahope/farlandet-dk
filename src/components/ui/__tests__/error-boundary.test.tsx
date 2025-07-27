import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ErrorBoundary, ErrorFallback } from '../error-boundary'

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

// Component that throws an error for testing
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Noget gik galt')).toBeInTheDocument()
    expect(screen.getByText(/Der opstod en uventet fejl/)).toBeInTheDocument()
  })

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Fejldetaljer (kun i udvikling)')).toBeInTheDocument()
    
    process.env.NODE_ENV = originalEnv
  })

  it('hides error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.queryByText('Fejldetaljer (kun i udvikling)')).not.toBeInTheDocument()
    
    process.env.NODE_ENV = originalEnv
  })

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('resets error state when reset button is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Noget gik galt')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Prøv igen'))
    
    // Re-render with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('reloads page when reload button is clicked', () => {
    const originalReload = window.location.reload
    window.location.reload = vi.fn()
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    fireEvent.click(screen.getByText('Genindlæs siden'))
    
    expect(window.location.reload).toHaveBeenCalled()
    
    window.location.reload = originalReload
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Noget gik galt')).not.toBeInTheDocument()
  })
})

describe('ErrorFallback', () => {
  const mockResetError = vi.fn()
  const testError = new Error('Test error message')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders error message', () => {
    render(<ErrorFallback error={testError} resetError={mockResetError} />)
    
    expect(screen.getByText('Der opstod en fejl')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('shows generic message when error has no message', () => {
    const errorWithoutMessage = new Error()
    errorWithoutMessage.message = ''
    
    render(<ErrorFallback error={errorWithoutMessage} resetError={mockResetError} />)
    
    expect(screen.getByText('En uventet fejl opstod')).toBeInTheDocument()
  })

  it('calls resetError when reset button is clicked', () => {
    render(<ErrorFallback error={testError} resetError={mockResetError} />)
    
    fireEvent.click(screen.getByText('Prøv igen'))
    
    expect(mockResetError).toHaveBeenCalled()
  })

  it('has proper styling and layout', () => {
    const { container } = render(<ErrorFallback error={testError} resetError={mockResetError} />)
    
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')
  })
})