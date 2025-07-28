import type { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { SetupBanner } from '../ui/setup-banner'
import { cn } from '../../lib/utils'

interface LayoutProps {
  children: ReactNode
  onSearchChange?: (query: string) => void
  className?: string
  showHeader?: boolean
  showFooter?: boolean
}

export function Layout({ 
  children, 
  onSearchChange, 
  className,
  showHeader = true,
  showFooter = true
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SetupBanner />
      {showHeader && (
        <Header 
          onSearchChange={onSearchChange}
        />
      )}
      
      <main className={cn(
        "flex-1 container mx-auto px-4 py-6",
        className
      )}>
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  )
}