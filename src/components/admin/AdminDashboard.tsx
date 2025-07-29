import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  BarChart3, 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  LogOut,
  Settings
} from 'lucide-react'
import { useAdminAuth, useAdminApi } from '../../contexts/AdminAuthContext'
import { api, type AdminDashboard as DashboardData, type Resource } from '../../lib/api'

export function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [pendingResources, setPendingResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { user, logout } = useAdminAuth()
  const { makeAuthenticatedRequest } = useAdminApi()

  useEffect(() => {
    loadDashboardData()
    loadPendingResources()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await makeAuthenticatedRequest((token) => 
        api.getAdminDashboard(token)
      )
      
      if (response.success && response.data) {
        setDashboardData(response.data)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const loadPendingResources = async () => {
    try {
      const response = await makeAuthenticatedRequest((token) => 
        api.getAdminResources(token, { status: 'pending', limit: 10 })
      )
      
      if (response.success && response.data) {
        setPendingResources(response.data)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const moderateResource = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await makeAuthenticatedRequest((token) => 
        api.moderateResource(token, id, status)
      )
      
      // Refresh data
      await loadDashboardData()
      await loadPendingResources()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Indlæser dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Fejl</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Prøv igen
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Farlandet Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Velkommen, {user?.name}
              </span>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Indstillinger
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Log ud
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Afventende
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {dashboardData.stats.pending}
                </div>
                <p className="text-xs text-muted-foreground">
                  ressourcer til godkendelse
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Godkendte
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {dashboardData.stats.approved}
                </div>
                <p className="text-xs text-muted-foreground">
                  ressourcer publiceret
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Ressourcer
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.stats.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  alle ressourcer
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Kategorier
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.stats.categories}
                </div>
                <p className="text-xs text-muted-foreground">
                  aktive kategorier
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pending Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Ressourcer til godkendelse</CardTitle>
            <CardDescription>
              Ressourcer der afventer moderation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingResources.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Ingen ressourcer afventer godkendelse
              </p>
            ) : (
              <div className="space-y-4">
                {pendingResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{resource.title}</h3>
                      {resource.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{resource.type}</Badge>
                        {resource.category && (
                          <Badge variant="outline">{resource.category.name}</Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(resource.created_at).toLocaleDateString('da-DK')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => moderateResource(resource.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Godkend
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moderateResource(resource.id, 'rejected')}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Afvis
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}