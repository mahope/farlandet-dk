import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { LoadingSpinner } from '../../components/ui/loading-spinner'
import { useAuth } from '../../contexts/AuthContext'
import { useSEO } from '../../hooks/useSEO'
import { tables } from '../../lib/supabase'
import { Navigate } from 'react-router-dom'

interface AdminStats {
  totalResources: number
  pendingResources: number
  approvedResources: number
  rejectedResources: number
  totalUsers: number
  totalCategories: number
  totalTags: number
}

export function AdminDashboard() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useSEO({
    title: 'Admin Dashboard - Farlandet.dk',
    description: 'Administration dashboard for Farlandet.dk',
    url: 'https://farlandet.dk/admin',
  })

  // Check if user is admin (you might want to add proper role checking)
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

  // Redirect non-admin users
  if (user && !loading && !isAdmin) {
    return <Navigate to="/" replace />
  }

  useEffect(() => {
    async function fetchStats() {
      if (!isAdmin) return

      try {
        setLoading(true)

        // Get resource counts by status
        const [totalRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
          tables.resources().select('id', { count: 'exact', head: true }),
          tables.resources().select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          tables.resources().select('id', { count: 'exact', head: true }).eq('status', 'approved'),
          tables.resources().select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
        ])

        // Get other counts
        const [usersRes, categoriesRes, tagsRes] = await Promise.all([
          tables.user_profiles().select('id', { count: 'exact', head: true }),
          tables.categories().select('id', { count: 'exact', head: true }),
          tables.tags().select('id', { count: 'exact', head: true }),
        ])

        setStats({
          totalResources: totalRes.count || 0,
          pendingResources: pendingRes.count || 0,
          approvedResources: approvedRes.count || 0,
          rejectedResources: rejectedRes.count || 0,
          totalUsers: usersRes.count || 0,
          totalCategories: categoriesRes.count || 0,
          totalTags: tagsRes.count || 0,
        })
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [isAdmin])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Indlæser admin dashboard..." />
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Velkommen {profile?.username || user.email}, administrer Farlandet.dk
        </p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Afventende Ressourcer</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingResources}</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Godkendte Ressourcer</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvedResources}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Ressourcer</p>
                <p className="text-2xl font-bold">{stats.totalResources}</p>
              </div>
              <div className="text-3xl">📚</div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registrerede Brugere</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">📋 Moderation</h3>
          <p className="text-muted-foreground mb-4">
            Gennemgå og godkend indsendte ressourcer
          </p>
          <Button asChild className="w-full">
            <a href="/admin/moderation">
              Gennemgå Ressourcer
              {stats?.pendingResources && stats.pendingResources > 0 && (
                <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                  {stats.pendingResources}
                </span>
              )}
            </a>
          </Button>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">👥 Brugere</h3>
          <p className="text-muted-foreground mb-4">
            Administrer brugere og roller
          </p>
          <Button asChild variant="outline" className="w-full">
            <a href="/admin/users">Administrer Brugere</a>
          </Button>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">🏷️ Indhold</h3>
          <p className="text-muted-foreground mb-4">
            Administrer kategorier og tags
          </p>
          <Button asChild variant="outline" className="w-full">
            <a href="/admin/content">Administrer Indhold</a>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Oversigt</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Kategorier:</p>
            <p className="font-medium">{stats?.totalCategories}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tags:</p>
            <p className="font-medium">{stats?.totalTags}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Afvist:</p>
            <p className="font-medium text-red-600">{stats?.rejectedResources}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Aktivitet:</p>
            <p className="font-medium text-blue-600">🔥 Aktiv</p>
          </div>
        </div>
      </div>
    </div>
  )
}