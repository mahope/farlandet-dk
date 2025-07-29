import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Menu, X, User, LogOut, Sparkles } from 'lucide-react'
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
      "sticky top-0 z-50 w-full glass border-b border-border/40 animate-fade-in",
      className
    )}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="group flex items-center space-x-2 transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center space-x-1">
                <Sparkles className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-200" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Farlandet
                </span>
              </div>
            </Link>
            
            {/* Navigation Links - Hidden on mobile */}
            <nav className="hidden md:flex items-center space-x-1">
              {[
                { path: '/', label: 'Hjem' },
                { path: '/categories', label: 'Kategorier' },
                { path: '/submit', label: 'Bidrag' }
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent animate-slide-in",
                    location.pathname === item.path 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
              <input
                type="text"
                placeholder="Søg efter ressourcer, tips, guides..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-3">
            {user && (isAdmin || isModerator) && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-accent/50 animate-scale-in">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">
                    {user.username || user.email?.split('@')[0]}
                  </span>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 hover:from-orange-600 hover:to-red-600 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Link to="/admin">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
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
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
              >
                <Link to="/admin">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Admin Login
                </Link>
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-accent transition-all duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5 rotate-90 transition-transform duration-200" />
            ) : (
              <Menu className="h-5 w-5 transition-transform duration-200" />
            )}
          </Button>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4 animate-fade-in">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
            <input
              type="text"
              placeholder="Søg efter ressourcer..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 shadow-sm"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/40 glass animate-scale-in">
            <nav className="py-6 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                {[
                  { path: '/', label: 'Hjem' },
                  { path: '/categories', label: 'Kategorier' },
                  { path: '/submit', label: 'Bidrag' }
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      location.pathname === item.path 
                        ? "text-primary bg-primary/10" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Mobile User Section */}
              {user && (isAdmin || isModerator) && (
                <div className="pt-4 border-t border-border/40 space-y-3">
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-accent/50">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">
                      {user.username || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 hover:from-orange-600 hover:to-red-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/admin">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log ud
                  </Button>
                </div>
              )}
              {!user && (
                <div className="pt-4 border-t border-border/40">
                  <Button 
                    asChild
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/admin">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Admin Login
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}