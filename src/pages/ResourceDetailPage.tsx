import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { VoteButton } from '@/components/gamification/vote-button'
import { Confetti, useConfetti } from '@/components/gamification/confetti'
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
  AlertCircle,
  Check,
  Copy
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
  const [categoryResources, setCategoryResources] = useState<Resource[]>([])
  const [copied, setCopied] = useState(false)
  const { isActive: showConfetti, trigger: triggerConfetti } = useConfetti()

  useEffect(() => {
    async function fetchResource() {
      if (!id) return

      setLoading(true)
      setError(null)

      try {
        const response = await api.getResource(parseInt(id, 10))

        if (response.success && response.data) {
          setResource(response.data)

          // Fetch related resources via tags (primary)
          const tagRelatedRes = await api.getRelatedResources(parseInt(id, 10), { limit: 4 })
          if (tagRelatedRes.success && tagRelatedRes.data) {
            setRelatedResources(tagRelatedRes.data.slice(0, 3))
          }

          // Fetch related resources from same category (fallback)
          if (response.data.category_slug) {
            const categoryRes = await api.getCategoryResources(response.data.category_slug, {
              limit: 4
            })
            if (categoryRes.success && categoryRes.data) {
              // Filter out current resource and any already in tag-related
              const tagRelatedIds = new Set((tagRelatedRes.data || []).map(r => r.id))
              setCategoryResources(
                categoryRes.data.resources
                  .filter(r => r.id !== parseInt(id, 10) && !tagRelatedIds.has(r.id))
                  .slice(0, 3)
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
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleVote = async (voted: boolean) => {
    if (voted) {
      triggerConfetti()
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
        <div className="container mx-auto px-4 py-12">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tilbage
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8 space-y-6">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-10 w-3/4" />
                  <div className="flex gap-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-2/3" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !resource) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Ressource ikke fundet</h1>
            <p className="text-muted-foreground mb-8">
              {error || 'Den ressource du leder efter eksisterer ikke.'}
            </p>
            <Button onClick={() => navigate('/resources')} size="lg">
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
      <Confetti active={showConfetti} />

      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Tilbage
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card interactive={false}>
              <CardContent className="p-8">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {resource.category_name && (
                    <Link to={`/resources?category=${resource.category_slug}`}>
                      <Badge
                        variant="outline"
                        className="hover:scale-105 transition-transform cursor-pointer"
                        style={{
                          borderColor: resource.category_color,
                          color: resource.category_color
                        }}
                      >
                        {resource.category_name}
                      </Badge>
                    </Link>
                  )}
                  <Badge variant="secondary" className="flex items-center gap-1.5">
                    <TypeIcon className="w-3.5 h-3.5" />
                    {RESOURCE_TYPE_LABELS[resource.resource_type]}
                  </Badge>
                </div>

                {/* Title */}
                <h1 className="text-display-sm font-bold mb-6">{resource.title}</h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b border-border/50">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {formatDate(resource.created_at)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Heart className={cn(
                      "w-4 h-4",
                      resource.vote_score > 0 && "text-accent fill-accent"
                    )} />
                    <span className="font-semibold">{resource.vote_score}</span> stemmer
                  </span>
                  {resource.view_count !== undefined && (
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span className="font-semibold">{resource.view_count}</span> visninger
                    </span>
                  )}
                </div>

                {/* Description */}
                {resource.description && (
                  <div className="mb-8">
                    <p className="text-lg leading-relaxed whitespace-pre-wrap text-foreground/90">
                      {resource.description}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {resource.tags && resource.tags.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {resource.tags.map((tag) => (
                        <Link
                          key={tag}
                          to={`/resources?tag=${encodeURIComponent(tag)}`}
                        >
                          <Badge
                            variant="secondary"
                            className="hover:scale-105 transition-transform cursor-pointer"
                          >
                            {tag}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-4 pt-8 border-t border-border/50">
                  {resource.url && (
                    <Button
                      asChild
                      variant="accent"
                      size="lg"
                      className="group"
                    >
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                        Åbn ressource
                      </a>
                    </Button>
                  )}

                  <VoteButton
                    initialVotes={resource.vote_score}
                    onVote={handleVote}
                    size="lg"
                  />

                  <Button variant="outline" onClick={handleShare} className="gap-2">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-success" />
                        Kopieret!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        Del
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <Card interactive={false}>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Om denne ressource</h3>
                <dl className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-semibold flex items-center gap-1.5">
                      <TypeIcon className="w-4 h-4 text-primary" />
                      {RESOURCE_TYPE_LABELS[resource.resource_type]}
                    </dd>
                  </div>
                  {resource.category_name && (
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <dt className="text-muted-foreground">Kategori</dt>
                      <dd className="font-semibold">{resource.category_name}</dd>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <dt className="text-muted-foreground">Tilføjet</dt>
                    <dd className="font-semibold">{formatDate(resource.created_at)}</dd>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <dt className="text-muted-foreground">Popularitet</dt>
                    <dd className="font-semibold flex items-center gap-1.5">
                      <Heart className={cn(
                        "w-4 h-4",
                        resource.vote_score > 0 && "text-accent fill-accent"
                      )} />
                      {resource.vote_score}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Copy Link Card */}
            <Card interactive={false}>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Del denne ressource</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={window.location.href}
                    readOnly
                    className="flex-1 px-3 py-2 bg-muted/50 rounded-xl text-sm truncate border border-border/50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tag-Related Resources */}
            {relatedResources.length > 0 && (
              <Card interactive={false}>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Relateret via tags</h3>
                  <div className="space-y-3">
                    {relatedResources.map((related) => (
                      <Link
                        key={related.id}
                        to={`/resources/${related.id}`}
                        className="block p-4 rounded-2xl hover:bg-primary/5 transition-all duration-300 group"
                      >
                        <h4 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {related.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className={cn(
                              "w-3 h-3",
                              related.vote_score > 0 && "text-accent"
                            )} />
                            {related.vote_score}
                          </span>
                          <span>·</span>
                          <span>{RESOURCE_TYPE_LABELS[related.resource_type]}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Category-Related Resources */}
            {categoryResources.length > 0 && (
              <Card interactive={false}>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Fra samme kategori</h3>
                  <div className="space-y-3">
                    {categoryResources.map((related) => (
                      <Link
                        key={related.id}
                        to={`/resources/${related.id}`}
                        className="block p-4 rounded-2xl hover:bg-primary/5 transition-all duration-300 group"
                      >
                        <h4 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {related.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className={cn(
                              "w-3 h-3",
                              related.vote_score > 0 && "text-accent"
                            )} />
                            {related.vote_score}
                          </span>
                          <span>·</span>
                          <span>{RESOURCE_TYPE_LABELS[related.resource_type]}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    to={`/resources?category=${resource.category_slug}`}
                    className="block mt-4 text-sm text-primary hover:text-primary/80 font-semibold transition-colors"
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
