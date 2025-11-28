import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ExternalLink,
  Heart,
  Clock,
  Eye,
  ArrowLeft,
  Share2,
  BookOpen,
  Headphones,
  FileText,
  Lightbulb,
  Video,
  Film,
  Tv,
  Link as LinkIcon,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { api, Resource, ResourceType } from '@/lib/api'
import { cn } from '@/lib/utils'

const RESOURCE_TYPE_ICONS: Record<ResourceType, typeof BookOpen> = {
  book: BookOpen,
  podcast: Headphones,
  article: FileText,
  tip: Lightbulb,
  video: Video,
  movie: Film,
  tv_series: Tv,
  link: LinkIcon,
  pdf: FileText
}

const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  book: 'Bog',
  podcast: 'Podcast',
  article: 'Artikel',
  tip: 'Tip',
  video: 'Video',
  movie: 'Film',
  tv_series: 'TV-serie',
  link: 'Link',
  pdf: 'PDF'
}

export function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relatedResources, setRelatedResources] = useState<Resource[]>([])

  useEffect(() => {
    async function fetchResource() {
      if (!id) return

      setLoading(true)
      setError(null)

      try {
        const response = await api.getResource(parseInt(id, 10))

        if (response.success && response.data) {
          setResource(response.data)

          // Fetch related resources from same category
          if (response.data.category_slug) {
            const relatedRes = await api.getCategoryResources(response.data.category_slug, {
              limit: 4
            })
            if (relatedRes.success && relatedRes.data) {
              // Filter out current resource
              setRelatedResources(
                relatedRes.data.resources.filter(r => r.id !== parseInt(id, 10)).slice(0, 3)
              )
            }
          }
        } else {
          setError('Ressourcen blev ikke fundet')
        }
      } catch (err) {
        console.error('Failed to fetch resource:', err)
        setError('Kunne ikke hente ressourcen')
      } finally {
        setLoading(false)
      }
    }

    fetchResource()
  }, [id])

  const handleShare = async () => {
    if (navigator.share && resource) {
      try {
        await navigator.share({
          title: resource.title,
          text: resource.description,
          url: window.location.href
        })
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      alert('Link kopieret til udklipsholder!')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !resource) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Ressource ikke fundet</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'Den ressource du leder efter eksisterer ikke.'}
            </p>
            <Button onClick={() => navigate('/resources')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbage til ressourcer
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  const TypeIcon = RESOURCE_TYPE_ICONS[resource.resource_type] || LinkIcon

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tilbage
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {resource.category_name && (
                    <Link to={`/resources?category=${resource.category_slug}`}>
                      <Badge
                        variant="outline"
                        className="hover:bg-accent/10 cursor-pointer"
                        style={{
                          borderColor: resource.category_color,
                          color: resource.category_color
                        }}
                      >
                        {resource.category_name}
                      </Badge>
                    </Link>
                  )}
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <TypeIcon className="w-3 h-3" />
                    {RESOURCE_TYPE_LABELS[resource.resource_type]}
                  </Badge>
                </div>

                {/* Title */}
                <h1 className="text-display-sm mb-4">{resource.title}</h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDate(resource.created_at)}
                  </span>
                  <span className="flex items-center">
                    <Heart className={cn(
                      "w-4 h-4 mr-1",
                      resource.vote_score > 0 && "text-accent fill-accent"
                    )} />
                    {resource.vote_score} stemmer
                  </span>
                  {resource.view_count !== undefined && (
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {resource.view_count} visninger
                    </span>
                  )}
                </div>

                {/* Description */}
                {resource.description && (
                  <div className="prose prose-neutral dark:prose-invert max-w-none mb-6">
                    <p className="text-lg leading-relaxed whitespace-pre-wrap">
                      {resource.description}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {resource.tags && resource.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {resource.tags.map((tag) => (
                        <Link
                          key={tag}
                          to={`/resources?tag=${encodeURIComponent(tag)}`}
                          className="text-sm px-3 py-1 bg-secondary/50 hover:bg-secondary rounded-full text-secondary-foreground transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
                  {resource.url && (
                    <Button
                      asChild
                      className="btn-accent"
                    >
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Åbn ressource
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Del
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Om denne ressource</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium flex items-center">
                      <TypeIcon className="w-4 h-4 mr-1" />
                      {RESOURCE_TYPE_LABELS[resource.resource_type]}
                    </dd>
                  </div>
                  {resource.category_name && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Kategori</dt>
                      <dd className="font-medium">{resource.category_name}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Tilføjet</dt>
                    <dd className="font-medium">{formatDate(resource.created_at)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Popularitet</dt>
                    <dd className="font-medium flex items-center">
                      <Heart className={cn(
                        "w-4 h-4 mr-1",
                        resource.vote_score > 0 && "text-accent fill-accent"
                      )} />
                      {resource.vote_score}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Related Resources */}
            {relatedResources.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Lignende ressourcer</h3>
                  <div className="space-y-3">
                    {relatedResources.map((related) => (
                      <Link
                        key={related.id}
                        to={`/resources/${related.id}`}
                        className="block p-3 rounded-lg hover:bg-accent/10 transition-colors"
                      >
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {related.title}
                        </h4>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Heart className={cn(
                            "w-3 h-3 mr-1",
                            related.vote_score > 0 && "text-accent"
                          )} />
                          {related.vote_score}
                          <span className="mx-2">·</span>
                          {RESOURCE_TYPE_LABELS[related.resource_type]}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    to={`/resources?category=${resource.category_slug}`}
                    className="block mt-4 text-sm text-primary hover:underline"
                  >
                    Se alle i {resource.category_name} →
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ResourceDetailPage
