import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { LoadingSpinner } from '../../components/ui/loading-spinner'
import { Alert } from '../../components/ui/alert'
import { useAuth } from '../../contexts/AuthContext'
import { tables } from '../../lib/supabase'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { Navigate } from 'react-router-dom'
import type { Resource } from '../../types'

type ModerationAction = 'approve' | 'reject' | null

export function ModerationPage() {
  const { user, profile } = useAuth()
  const [pendingResources, setPendingResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />
  }

  useEffect(() => {
    fetchResources()
  }, [filter])

  const fetchResources = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = tables.resources()
        .select(`
          *,
          category:categories(*),
          tags:resource_tags(tag:tags(*))
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) {
        setError('Fejl ved hentning af ressourcer: ' + error.message)
        return
      }

      const transformedResources = data?.map(resource => ({
        ...resource,
        tags: resource.tags?.map((rt: any) => rt.tag).filter(Boolean) || [],
        category: resource.category || undefined
      })) as Resource[]

      setPendingResources(transformedResources || [])
    } catch (err) {
      setError('Der opstod en uventet fejl')
      console.error('Error fetching resources:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleModerationAction = async (resourceId: string, action: ModerationAction, reason?: string) => {
    if (!action) return

    try {
      setActionLoading(resourceId)
      setError(null)

      const newStatus = action === 'approve' ? 'approved' : 'rejected'

      const { error } = await tables.resources()
        .update({ 
          status: newStatus,
          moderated_at: new Date().toISOString(),
          moderated_by: user.id,
          moderation_reason: reason || null
        })
        .eq('id', resourceId)

      if (error) {
        setError(`Fejl ved ${action === 'approve' ? 'godkendelse' : 'afvisning'}: ` + error.message)
        return
      }

      // Remove from list if filtering by pending
      if (filter === 'pending') {
        setPendingResources(prev => prev.filter(r => r.id !== resourceId))
      } else {
        // Refresh to show updated status
        fetchResources()
      }
    } catch (err) {
      setError('Der opstod en uventet fejl')
      console.error('Error moderating resource:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const getResourceTypeLabel = (type: string) => {
    const labels = {
      link: '🔗 Link',
      article: '📰 Artikel',
      podcast: '🎧 Podcast',
      video: '🎥 Video',
      book: '📚 Bog',
      pdf: '📄 PDF',
      tip: '💡 Tip',
      movie: '🍿 Film',
      tv_series: '📺 TV-serie'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    const labels = {
      pending: 'Afventer',
      approved: 'Godkendt',
      rejected: 'Afvist'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Moderation</h1>
            <p className="text-muted-foreground">
              Gennemgå og administrer indsendte ressourcer
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-2">
            {[
              { key: 'pending', label: 'Afventende', icon: '⏳' },
              { key: 'approved', label: 'Godkendt', icon: '✅' },
              { key: 'rejected', label: 'Afvist', icon: '❌' },
              { key: 'all', label: 'Alle', icon: '📋' },
            ].map(({ key, label, icon }) => (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(key as typeof filter)}
              >
                {icon} {label}
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text="Indlæser ressourcer..." />
          </div>
        ) : pendingResources.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold mb-2">
              {filter === 'pending' ? 'Ingen afventende ressourcer' : 'Ingen ressourcer fundet'}
            </h3>
            <p className="text-muted-foreground">
              {filter === 'pending' 
                ? 'Alle ressourcer er blevet gennemgået!' 
                : 'Prøv at ændre filteret for at se andre ressourcer.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingResources.map((resource) => (
              <div key={resource.id} className="bg-card border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">
                        {getResourceTypeLabel(resource.resource_type)}
                      </span>
                      {getStatusBadge(resource.status)}
                      {resource.category && (
                        <span 
                          className="px-2 py-1 rounded-full text-xs text-white"
                          style={{ backgroundColor: resource.category.color }}
                        >
                          {resource.category.name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                    {resource.description && (
                      <p className="text-muted-foreground mb-3">{resource.description}</p>
                    )}
                    
                    {/* Resource Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Indsendt:</span>
                        <span className="ml-2">{new Date(resource.created_at).toLocaleDateString('da-DK')}</span>
                      </div>
                      {resource.submitter_email && (
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <span className="ml-2">{resource.submitter_email}</span>
                        </div>
                      )}
                      {resource.url && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">URL:</span>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:underline"
                          >
                            {resource.url}
                          </a>
                        </div>
                      )}
                      {resource.tags && resource.tags.length > 0 && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {resource.tags.map((tag: any) => (
                              <span 
                                key={tag.id}
                                className="px-2 py-1 bg-muted rounded text-xs"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {resource.status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleModerationAction(resource.id, 'approve')}
                        disabled={actionLoading === resource.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading === resource.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          '✅ Godkend'
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const reason = prompt('Grund til afvisning (valgfri):')
                          handleModerationAction(resource.id, 'reject', reason || undefined)
                        }}
                        disabled={actionLoading === resource.id}
                      >
                        ❌ Afvis
                      </Button>
                    </div>
                  )}
                </div>

                {/* Moderation Info */}
                {resource.status !== 'pending' && resource.moderated_at && (
                  <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                    <span>
                      {resource.status === 'approved' ? 'Godkendt' : 'Afvist'} den{' '}
                      {new Date(resource.moderated_at).toLocaleDateString('da-DK')}
                    </span>
                    {resource.moderation_reason && (
                      <span className="ml-4">
                        Grund: {resource.moderation_reason}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}