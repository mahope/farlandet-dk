import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../ui/button'
import { useAuth } from '../../contexts/AuthContext'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()
  const { user, profile } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Moderation', href: '/admin/moderation', icon: '📋' },
    { name: 'Brugere', href: '/admin/users', icon: '👥' },
    { name: 'Indhold', href: '/admin/content', icon: '🏷️' },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-xl font-bold text-primary">
                Farlandet.dk
              </Link>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                ADMIN
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {profile?.username || user?.email}
              </span>
              <Button asChild variant="outline" size="sm">
                <Link to="/">← Tilbage til site</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex">
          {/* Sidebar Navigation */}
          <nav className="w-64 py-6 pr-6">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Quick Stats in Sidebar */}
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-3">Hurtig Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Online:</span>
                  <span className="text-green-600">●</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rolle:</span>
                  <span className="capitalize">{profile?.role || 'user'}</span>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}