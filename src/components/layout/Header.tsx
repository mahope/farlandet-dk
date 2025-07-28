import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Menu, X, User, LogOut } from 'lucide-react'
import { Button } from '../ui/button'
import { useAuth } from '../../contexts/PocketBaseAuthContext'
import { cn } from '../../lib/utils'

interface HeaderProps {
  onSearchChange?: (query: string) => void
  className?: string
}

export function Header({ onSearchChange, className }: HeaderProps) {
  const { user, signOut, isAdmin, isModerator } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearchChange?.(query)
  }

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
  }

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-primary hover:opacity-80">
              Farlandet.dk
            </Link>
            
            {/* Navigation Links - Hidden on mobile */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === "/" ? "text-primary" : "text-muted-foreground"
                )}
              >
                Hjem
              </Link>
              <Link
                to="/resources"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === "/resources" ? "text-primary" : "text-muted-foreground"
                )}
              >
                Alle Ressourcer
              </Link>
            </nav>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Søg efter ressourcer..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </div>

          {/* Desktop Navigation - Only show admin login */}
          <nav className="hidden md:flex items-center space-x-4">
            {user && (isAdmin || isModerator) && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-muted">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {user.username || user.email?.split('@')[0]}
                  </span>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <Link to="/admin">
                    🛡️ Admin
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log ud
                </Button>
              </div>
            )}
            {!user && (
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin">
                  🛡️ Admin Login
                </Link>
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Søg efter ressourcer..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="py-4 space-y-2">
              {user && (isAdmin || isModerator) && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-muted">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {user.username || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    <Link to="/admin">
                      🛡️ Admin Panel
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log ud
                  </Button>
                </div>
              )}
              {!user && (
                <Button 
                  asChild
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/admin">
                    🛡️ Admin Login
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}