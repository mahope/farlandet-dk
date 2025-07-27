import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { useAuth } from '../contexts/AuthContext'
import { useSEO } from '../hooks/useSEO'
import { tables } from '../lib/supabase'
import type { Resource } from '../types'

export function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch resource details
  useEffect(() => {
    async function fetchResource() {
      if (!id) {
        setError('Ingen ressource ID angivet')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data, error } = await tables.resources()
          .select(`
            *,
            category:categories(*),
            tags:resource_tags(tag:tags(*))
          `)
          .eq('id', id)
          .eq('status', 'approved')
          .single()

        if (error) {
          console.error('Error fetching resource:', error)
          setError('Kunne ikke hente ressource')
          return
        }

        if (data) {
          const transformedResource = {
            ...data,
            tags: data.tags?.map((rt: any) => rt.tag).filter(Boolean) || [],
            category: data.category || undefined
          } as Resource
          setResource(transformedResource)
        } else {
          setError('Ressource ikke fundet')
        }
      } catch (error) {
        console.error('Error fetching resource:', error)
        setError('Der opstod en fejl ved hentning af ressourcen')
      } finally {
        setLoading(false)
      }
    }

    fetchResource()
  }, [id])

  // SEO optimization
  useSEO({
    title: resource ? `${resource.title} - Farlandet.dk` : 'Ressource - Farlandet.dk',
    description: resource?.description || 'Ressource delt af danske fædre på Farlandet.dk',
    keywords: [
      'danske fædre ressourcer',
      resource?.category?.name || '',
      ...(resource?.tags?.map(tag => tag.name) || []),
      resource?.resource_type || ''
    ].filter(Boolean),
    url: `https://farlandet.dk/resource/${id}`,
    type: 'article',
    image: resource?.thumbnail_url
  })

  const getResourceTypeIcon = (type: string) => {
    const icons = {
      podcast: '🎧',
      article: '📰',
      book: '📚',
      video: '🎥',
      tip: '💡',
      pdf: '📄',
      link: '🔗',
      movie: '🍿',
      tv_series: '📺'
    }
    return icons[type as keyof typeof icons] || '📋'
  }

  const getResourceTypeLabel = (type: string) => {
    const labels = {
      link: 'Link',
      article: 'Artikel',
      podcast: 'Podcast',
      video: 'Video',
      book: 'Bog',
      pdf: 'PDF',
      tip: 'Tip',
      movie: 'Film',
      tv_series: 'TV-serie'
    }
    return labels[type as keyof typeof labels] || type
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <LoadingSpinner size="lg" text="Henter ressource..." />
        </div>
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Ressource ikke fundet</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'Den anmodede ressource kunne ikke findes eller er ikke godkendt endnu.'}
          </p>
          <Button onClick={() => navigate('/resources')}>
            Tilbage til ressourcer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Hjem</Link>
          <span>/</span>
          <Link to="/resources" className="hover:text-foreground">Ressourcer</Link>
          <span>/</span>
          <span className="text-foreground">{resource.title}</span>
        </div>
      </nav>

      {/* Resource Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl">
            {getResourceTypeIcon(resource.resource_type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 text-xs rounded-full bg-muted">
                {getResourceTypeLabel(resource.resource_type)}
              </span>
              {resource.category && (
                <span 
                  className="px-2 py-1 text-xs rounded-full text-white"
                  style={{ backgroundColor: resource.category.color }}
                >
                  {resource.category.name}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{resource.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Tilføjet {new Date(resource.created_at).toLocaleDateString('da-DK')}</span>
              {resource.vote_score > 0 && (
                <span className="text-green-600 font-medium">
                  +{resource.vote_score} stemmer
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resource Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {resource.description && (
            <div className="bg-card p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Beskrivelse</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {resource.description}
              </p>
            </div>
          )}

          {/* Additional Information */}
          <div className="bg-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Detaljer</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="font-medium text-sm text-muted-foreground">Type</dt>
                <dd className="mt-1">{getResourceTypeLabel(resource.resource_type)}</dd>
              </div>
              {resource.category && (
                <div>
                  <dt className="font-medium text-sm text-muted-foreground">Kategori</dt>
                  <dd className="mt-1">{resource.category.name}</dd>
                </div>
              )}
              <div>
                <dt className="font-medium text-sm text-muted-foreground">Tilføjet</dt>
                <dd className="mt-1">{new Date(resource.created_at).toLocaleDateString('da-DK')}</dd>
              </div>
              {resource.vote_score !== undefined && (
                <div>
                  <dt className="font-medium text-sm text-muted-foreground">Stemmer</dt>
                  <dd className="mt-1">+{resource.vote_score}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="bg-card p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag: any) => (
                  <span 
                    key={tag.id}
                    className="px-3 py-1 bg-muted rounded-full text-sm"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Button */}
          {resource.url && (
            <div className="bg-card p-6 rounded-lg">
              <h3 className="font-semibold mb-4">Besøg ressource</h3>
              <a 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full" size="lg">
                  {getResourceTypeIcon(resource.resource_type)} Åbn ressource
                </Button>
              </a>
              <p className="text-xs text-muted-foreground mt-2">
                Åbner i nyt vindue
              </p>
            </div>
          )}

          {/* Share */}
          <div className="bg-card p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Del ressource</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
              >
                📋 Kopier link
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  const text = `Tjek denne ressource fra Farlandet.dk: ${resource.title} - ${window.location.href}`
                  navigator.share ? navigator.share({ title: resource.title, text, url: window.location.href }) 
                    : navigator.clipboard.writeText(text)
                }}
              >
                📤 Del
              </Button>
            </div>
          </div>

          {/* Back to Resources */}
          <div className="bg-card p-6 rounded-lg">
            <Link to="/resources">
              <Button variant="outline" className="w-full">
                ← Tilbage til alle ressourcer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}