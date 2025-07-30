import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { 
  BarChart3, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  LogOut,
  Settings,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Users,
  Link as LinkIcon,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { useAdminAuth, useAdminApi } from '../../contexts/AdminAuthContext'
import { api, type AdminDashboard as DashboardData, type Resource } from '../../lib/api'

export function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [allResources, setAllResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResources, setSelectedResources] = useState<Set<number>>(new Set())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [previewResource, setPreviewResource] = useState<Resource | null>(null)
  
  const { user, logout } = useAdminAuth()
  const { makeAuthenticatedRequest } = useAdminApi()

  useEffect(() => {
    loadAllData()
  }, [])

  useEffect(() => {
    filterResources()
  }, [allResources, activeTab, searchQuery])

  const loadAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadDashboardData(),
        loadAllResources()
      ])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardData = async () => {
    const response = await makeAuthenticatedRequest((token) => 
      api.getAdminDashboard(token)
    )
    
    if (response.success && response.data) {
      setDashboardData(response.data)
    }
  }

  const loadAllResources = async () => {
    const response = await makeAuthenticatedRequest((token) => 
      api.getAdminResources(token, { status: 'all', limit: 100 })
    )
    
    if (response.success && response.data) {
      setAllResources(response.data)
    }
  }

  const filterResources = () => {
    let filtered = allResources

    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(resource => resource.status === activeTab)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(query) ||
        resource.description?.toLowerCase().includes(query) ||
        resource.type.toLowerCase().includes(query) ||
        resource.submitted_by?.toLowerCase().includes(query)
      )
    }

    setFilteredResources(filtered)
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      await loadAllData()
    } finally {
      setIsRefreshing(false)
    }
  }

  const moderateResource = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await makeAuthenticatedRequest((token) => 
        api.moderateResource(token, id, status)
      )
      
      // Refresh data
      await loadAllData()
      setSelectedResources(new Set())
    } catch (err: any) {
      setError(err.message)
    }
  }

  const deleteResource = async (id: number) => {
    if (!confirm('Er du sikker på at du vil slette denne ressource?')) return
    
    try {
      await makeAuthenticatedRequest((token) => 
        api.deleteAdminResource(token, id)
      )
      
      await loadAllData()
      setSelectedResources(new Set())
    } catch (err: any) {
      setError(err.message)
    }
  }

  const batchModerate = async (status: 'approved' | 'rejected') => {
    if (selectedResources.size === 0) return
    
    const action = status === 'approved' ? 'godkende' : 'afvise'
    if (!confirm(`Er du sikker på at du vil ${action} ${selectedResources.size} ressourcer?`)) return

    try {
      await Promise.all(
        Array.from(selectedResources).map(id =>
          makeAuthenticatedRequest((token) => 
            api.moderateResource(token, id, status)
          )
        )
      )
      
      await loadAllData()
      setSelectedResources(new Set())
    } catch (err: any) {
      setError(err.message)
    }
  }

  const batchDelete = async () => {
    if (selectedResources.size === 0) return
    
    if (!confirm(`Er du sikker på at du vil slette ${selectedResources.size} ressourcer?`)) return

    try {
      await Promise.all(
        Array.from(selectedResources).map(id =>
          makeAuthenticatedRequest((token) => 
            api.deleteAdminResource(token, id)
          )
        )
      )
      
      await loadAllData()
      setSelectedResources(new Set())
    } catch (err: any) {
      setError(err.message)
    }
  }

  const toggleResourceSelection = (id: number) => {
    const newSelected = new Set(selectedResources)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedResources(newSelected)
  }

  const selectAllVisible = () => {
    const visibleIds = new Set(filteredResources.map(r => r.id))
    setSelectedResources(visibleIds)
  }

  const clearSelection = () => {
    setSelectedResources(new Set())
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Opdater
              </Button>
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

        {/* Resource Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Ressource Håndtering</CardTitle>
                <CardDescription>
                  Administrer og moderer alle ressourcer
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Søg ressourcer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
              {[
                { key: 'pending', label: 'Afventende', icon: Clock },
                { key: 'approved', label: 'Godkendte', icon: CheckCircle },
                { key: 'rejected', label: 'Afviste', icon: XCircle },
                { key: 'all', label: 'Alle', icon: FileText }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === key
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                  <span className="ml-2 px-2 py-0.5 bg-gray-200 text-xs rounded-full">
                    {key === 'all' ? allResources.length : allResources.filter(r => r.status === key).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Batch Actions */}
            {selectedResources.size > 0 && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedResources.size} ressourcer valgt
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={clearSelection}
                  >
                    Ryd valg
                  </Button>
                  {activeTab === 'pending' && (
                    <>
                      <Button 
                        size="sm"
                        onClick={() => batchModerate('approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Godkend valgte
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => batchModerate('rejected')}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Afvis valgte
                      </Button>
                    </>
                  )}
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={batchDelete}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Slet valgte
                  </Button>
                </div>
              </div>
            )}

            {/* Select All */}
            {filteredResources.length > 0 && (
              <div className="flex justify-between items-center mb-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={selectAllVisible}
                >
                  Vælg alle synlige ({filteredResources.length})
                </Button>
                <span className="text-sm text-gray-600">
                  Viser {filteredResources.length} af {allResources.length} ressourcer
                </span>
              </div>
            )}

            {/* Resources List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Indlæser ressourcer...</p>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchQuery ? 'Ingen ressourcer matchede din søgning' : 'Ingen ressourcer fundet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResources.map((resource) => (
                  <div
                    key={resource.id}
                    className={`flex items-center p-4 border rounded-lg transition-colors ${
                      selectedResources.has(resource.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedResources.has(resource.id)}
                      onChange={() => toggleResourceSelection(resource.id)}
                      className="mr-4 h-4 w-4 text-blue-600 rounded"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{resource.title}</h3>
                          {resource.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {resource.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">{resource.type}</Badge>
                            <Badge 
                              variant={
                                resource.status === 'approved' ? 'default' : 
                                resource.status === 'rejected' ? 'destructive' : 'secondary'
                              }
                            >
                              {resource.status === 'approved' ? 'Godkendt' : 
                               resource.status === 'rejected' ? 'Afvist' : 'Afventende'}
                            </Badge>
                            {resource.submitted_by && (
                              <span className="text-xs text-gray-500">
                                <Users className="h-3 w-3 inline mr-1" />
                                {resource.submitted_by}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {new Date(resource.created_at).toLocaleDateString('da-DK')}
                            </span>
                          </div>
                          {resource.url && (
                            <div className="mt-2">
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <LinkIcon className="h-3 w-3 mr-1" />
                                {resource.url.length > 50 ? resource.url.substring(0, 50) + '...' : resource.url}
                              </a>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewResource(resource)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Se
                          </Button>
                          
                          {resource.status === 'pending' && (
                            <>
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
                            </>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteResource(resource.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resource Preview Modal */}
        {previewResource && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">Ressource Detaljer</h2>
                  <button
                    onClick={() => setPreviewResource(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Titel</Label>
                    <p className="text-gray-900 mt-1">{previewResource.title}</p>
                  </div>
                  
                  {previewResource.description && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Beskrivelse</Label>
                      <p className="text-gray-900 mt-1">{previewResource.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Type</Label>
                      <Badge variant="secondary" className="mt-1">{previewResource.type}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                      <Badge 
                        variant={
                          previewResource.status === 'approved' ? 'default' : 
                          previewResource.status === 'rejected' ? 'destructive' : 'secondary'
                        }
                        className="mt-1"
                      >
                        {previewResource.status === 'approved' ? 'Godkendt' : 
                         previewResource.status === 'rejected' ? 'Afvist' : 'Afventende'}
                      </Badge>
                    </div>
                  </div>
                  
                  {previewResource.url && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">URL</Label>
                      <a 
                        href={previewResource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 mt-1 block break-all"
                      >
                        {previewResource.url}
                      </a>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Indsendt af</Label>
                      <p className="text-gray-900 mt-1">{previewResource.submitted_by || 'Anonym'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Oprettet</Label>
                      <p className="text-gray-900 mt-1">{new Date(previewResource.created_at).toLocaleString('da-DK')}</p>
                    </div>
                  </div>
                  
                  {previewResource.tags && previewResource.tags.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {previewResource.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                  <Button variant="outline" onClick={() => setPreviewResource(null)}>
                    Luk
                  </Button>
                  {previewResource.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => {
                          moderateResource(previewResource.id, 'approved')
                          setPreviewResource(null)
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Godkend
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          moderateResource(previewResource.id, 'rejected')
                          setPreviewResource(null)
                        }}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Afvis
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}