import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LoadingSpinner, PageLoading, InlineLoading } from '../loading-spinner'

describe('LoadingSpinner', () => {
  it('renders spinner with default size', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('img', { hidden: true }) // Lucide icons have img role
    expect(spinner).toBeInTheDocument()
  })

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Loading data..." />)
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('applies correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    let spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('h-4', 'w-4')

    rerender(<LoadingSpinner size="md" />)
    spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('h-6', 'w-6')

    rerender(<LoadingSpinner size="lg" />)
    spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('h-8', 'w-8')
  })

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />)
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('has spinning animation', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('animate-spin')
  })
})

describe('PageLoading', () => {
  it('renders with default text', () => {
    render(<PageLoading />)
    
    expect(screen.getByText('Indlæser...')).toBeInTheDocument()
  })

  it('renders with custom text', () => {
    render(<PageLoading text="Loading page content..." />)
    
    expect(screen.getByText('Loading page content...')).toBeInTheDocument()
  })

  it('has proper minimum height for page loading', () => {
    const { container } = render(<PageLoading />)
    
    expect(container.firstChild).toHaveClass('min-h-[400px]')
  })

  it('centers content properly', () => {
    const { container } = render(<PageLoading />)
    
    expect(container.firstChild).toHaveClass('flex', 'items-center', 'justify-center')
  })

  it('uses large spinner size', () => {
    render(<PageLoading />)
    
    const spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('h-8', 'w-8')
  })

  it('applies custom className', () => {
    const { container } = render(<PageLoading className="custom-page-class" />)
    
    expect(container.firstChild).toHaveClass('custom-page-class')
  })
})

describe('InlineLoading', () => {
  it('renders spinner without text by default', () => {
    render(<InlineLoading />)
    
    const spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('h-4', 'w-4') // Small size for inline
  })

  it('renders with custom text', () => {
    render(<InlineLoading text="Processing..." />)
    
    expect(screen.getByText('Processing...')).toBeInTheDocument()
  })

  it('has horizontal layout', () => {
    const { container } = render(<InlineLoading text="Loading..." />)
    
    expect(container.firstChild).toHaveClass('flex', 'items-center', 'space-x-2')
  })

  it('applies custom className', () => {
    const { container } = render(<InlineLoading className="custom-inline-class" />)
    
    expect(container.firstChild).toHaveClass('custom-inline-class')
  })

  it('uses small spinner size for inline display', () => {
    render(<InlineLoading />)
    
    const spinner = screen.getByRole('img', { hidden: true })
    expect(spinner).toHaveClass('h-4', 'w-4')
  })
})