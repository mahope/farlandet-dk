import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Footer } from '../Footer'

describe('Footer', () => {
  it('renders footer with correct sections', () => {
    render(<Footer />)
    
    expect(screen.getByText('Om Danish Fathers Directory')).toBeInTheDocument()
    expect(screen.getByText('Hurtige Links')).toBeInTheDocument()
    expect(screen.getByText('Fællesskab')).toBeInTheDocument()
  })

  it('displays current year in copyright', () => {
    const currentYear = new Date().getFullYear()
    render(<Footer />)
    
    expect(screen.getByText(`© ${currentYear} Danish Fathers Directory.`)).toBeInTheDocument()
  })

  it('shows about section with description', () => {
    render(<Footer />)
    
    expect(screen.getByText(/Et fællesskab for danske fædre/)).toBeInTheDocument()
  })

  it('displays quick links', () => {
    render(<Footer />)
    
    expect(screen.getByText('Alle Ressourcer')).toBeInTheDocument()
    expect(screen.getByText('Kategorier')).toBeInTheDocument()
    expect(screen.getByText('Tilfældig Ressource')).toBeInTheDocument()
    expect(screen.getByText('Bidrag med Indhold')).toBeInTheDocument()
  })

  it('displays community links', () => {
    render(<Footer />)
    
    expect(screen.getByText('Retningslinjer')).toBeInTheDocument()
    expect(screen.getByText('Privatlivspolitik')).toBeInTheDocument()
    expect(screen.getByText('Kontakt')).toBeInTheDocument()
    expect(screen.getByText('Support')).toBeInTheDocument()
  })

  it('shows version information', () => {
    render(<Footer />)
    
    expect(screen.getByText('Version 1.0.0')).toBeInTheDocument()
  })

  it('displays heart icon in made with love section', () => {
    render(<Footer />)
    
    expect(screen.getByText('Lavet med')).toBeInTheDocument()
    expect(screen.getByText('af danske fædre.')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Footer className="custom-class" />)
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('has proper responsive grid layout', () => {
    const { container } = render(<Footer />)
    
    const gridContainer = container.querySelector('.grid')
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-3')
  })

  it('all links have proper hover states', () => {
    render(<Footer />)
    
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveClass('hover:text-foreground')
    })
  })
})