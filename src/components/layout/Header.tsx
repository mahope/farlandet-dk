import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Menu, X, User, LogOut, Sparkles } from 'lucide-react'
import { Button } from '../ui/button'
import { ThemeToggle } from '../ui/theme-toggle'
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
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Track scroll for glassmorphism intensity
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearchChange?.(query)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsMenuOpen(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
  }

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      // Glassmorphism effect
      "backdrop-blur-xl backdrop-saturate-150",
      isScrolled
        ? "bg-background/80 border-b border-border/50 shadow-lg shadow-black/5"
        : "bg-background/60 border-b border-transparent",
      className
    )}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="group flex items-center space-x-2 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Sparkles className="h-7 w-7 text-primary transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-primary-600 to-secondary bg-clip-text text-transparent">
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
              ].map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300",
                    "hover:bg-primary/10",
                    location.pathname === item.path
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {item.label}
                  {location.pathname === item.path && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-3">
            {/* Search Bar med glassmorphism */}
            <form onSubmit={handleSearchSubmit} className="relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
              <input
                type="text"
                placeholder="Søg ressourcer..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={cn(
                  "relative w-64 pl-11 pr-4 py-2.5 rounded-2xl text-sm font-medium",
                  "bg-card/80 backdrop-blur-sm border border-border/50",
                  "placeholder:text-muted-foreground/60",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                  "focus:shadow-lg focus:shadow-primary/5",
                  "transition-all duration-300"
                )}
              />
            </form>

            {/* Theme Toggle */}
            <ThemeToggle />

            {user && (isAdmin || isModerator) && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {user.username || user.email?.split('@')[0]}
                  </span>
                </div>
                <Button
                  asChild
                  variant="accent"
                  size="sm"
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
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="relative w-5 h-5">
                <Menu className={cn(
                  "absolute inset-0 transition-all duration-300",
                  isMenuOpen ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
                )} />
                <X className={cn(
                  "absolute inset-0 transition-all duration-300",
                  isMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
                )} />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
            <input
              type="text"
              placeholder="Søg efter ressourcer..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={cn(
                "w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium",
                "bg-card/80 backdrop-blur-sm border border-border/50",
                "placeholder:text-muted-foreground/60",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                "transition-all duration-300"
              )}
            />
          </form>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-out",
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
          <nav className="py-4 space-y-2 border-t border-border/50">
            {/* Mobile Navigation Links */}
            {[
              { path: '/', label: 'Hjem' },
              { path: '/categories', label: 'Kategorier' },
              { path: '/submit', label: 'Bidrag' }
            ].map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  location.pathname === item.path
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile User Section */}
            {user && (isAdmin || isModerator) && (
              <div className="pt-4 mt-4 border-t border-border/50 space-y-3">
                <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-primary/10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-foreground">
                      {user.username || user.email?.split('@')[0]}
                    </span>
                    <span className="text-xs text-muted-foreground">Administrator</span>
                  </div>
                </div>
                <Button
                  asChild
                  variant="accent"
                  className="w-full justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/admin">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full justify-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log ud
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
