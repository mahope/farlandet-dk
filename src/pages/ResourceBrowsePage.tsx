import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ExternalLink,
  Heart,
  Clock,
  Filter,
  ArrowUpDown,
  BookOpen,
  Headphones,
  FileText,
  Lightbulb,
  Video,
  Film,
  Tv,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { api, Resource, Category, ResourceType } from '@/lib/api'
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

const SORT_OPTIONS = [
  { value: 'newest', label: 'Nyeste først' },
  { value: 'popular', label: 'Mest populære' },
  { value: 'oldest', label: 'Ældste først' }
] as const

const ITEMS_PER_PAGE = 12

export function ResourceBrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // Get filter values from URL
  const currentCategory = searchParams.get('category') || ''
  const currentType = searchParams.get('type') || ''
  const currentSort = (searchParams.get('sort') as 'newest' | 'popular' | 'oldest') || 'newest'
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  // Fetch resources and categories
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [resourcesRes, categoriesRes] = await Promise.all([
          api.getResources({
            category: currentCategory || undefined,
            type: currentType || undefined,
            sort: currentSort,
            limit: ITEMS_PER_PAGE,
            offset: (currentPage - 1) * ITEMS_PER_PAGE
          }),
          api.getCategories()
        ])

        if (resourcesRes.success && resourcesRes.data) {
          setResources(resourcesRes.data)
          setTotalCount(resourcesRes.meta?.count || resourcesRes.data.length)
        }

        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data)
        }
      } catch (error) {
        console.error('Failed to fetch resources:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentCategory, currentType, currentSort, currentPage])

  // Update URL params
  const updateParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    // Reset to page 1 when filters change
    if (key !== 'page') {
      newParams.delete('page')
    }
    setSearchParams(newParams)
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display-md mb-2">Alle Ressourcer</h1>
          <p className="text-muted-foreground text-lg">
            Udforsk vores samling af ressourcer til fædre
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              <Filter className="inline-block w-4 h-4 mr-1" />
              Kategori
            </label>
            <select
              value={currentCategory}
              onChange={(e) => updateParams('category', e.target.value)}
              className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Alle kategorier</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name} ({cat.resource_count || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              <Filter className="inline-block w-4 h-4 mr-1" />
              Type
            </label>
            <select
              value={currentType}
              onChange={(e) => updateParams('type', e.target.value)}
              className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Alle typer</option>
              {Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              <ArrowUpDown className="inline-block w-4 h-4 mr-1" />
              Sortering
            </label>
            <select
              value={currentSort}
              onChange={(e) => updateParams('sort', e.target.value)}
              className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(currentCategory || currentType) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {currentCategory && (
              <Badge variant="secondary" className="px-3 py-1">
                {categories.find(c => c.slug === currentCategory)?.name}
                <button
                  onClick={() => updateParams('category', '')}
                  className="ml-2 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {currentType && (
              <Badge variant="secondary" className="px-3 py-1">
                {RESOURCE_TYPE_LABELS[currentType as ResourceType]}
                <button
                  onClick={() => updateParams('type', '')}
                  className="ml-2 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            <button
              onClick={() => {
                setSearchParams(new URLSearchParams())
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Ryd alle filtre
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!loading && resources.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Ingen ressourcer fundet</h3>
            <p className="text-muted-foreground mb-4">
              Prøv at ændre dine filtre eller søgekriterier
            </p>
            <Button onClick={() => setSearchParams(new URLSearchParams())}>
              Ryd filtre
            </Button>
          </div>
        )}

        {/* Resources Grid */}
        {!loading && resources.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {resources.map((resource) => {
                const TypeIcon = RESOURCE_TYPE_ICONS[resource.resource_type] || LinkIcon
                return (
                  <Link
                    key={resource.id}
                    to={`/resources/${resource.id}`}
                    className="group"
                  >
                    <Card className="h-full card-hover border-2 hover:border-primary/30">
                      <CardContent className="p-6">
                        {/* Category & Type */}
                        <div className="flex items-center justify-between mb-3">
                          {resource.category_name && (
                            <Badge
                              variant="outline"
                              style={{
                                borderColor: resource.category_color,
                                color: resource.category_color
                              }}
                            >
                              {resource.category_name}
                            </Badge>
                          )}
                          <div className="flex items-center text-muted-foreground">
                            <TypeIcon className="w-4 h-4 mr-1" />
                            <span className="text-xs">
                              {RESOURCE_TYPE_LABELS[resource.resource_type]}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {resource.title}
                        </h3>

                        {/* Description */}
                        {resource.description && (
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                            {resource.description}
                          </p>
                        )}

                        {/* Tags */}
                        {resource.tags && resource.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {resource.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 bg-secondary/50 rounded-full text-secondary-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                            {resource.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{resource.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center">
                              <Heart className={cn(
                                "w-4 h-4 mr-1",
                                resource.vote_score > 0 && "text-accent fill-accent"
                              )} />
                              {resource.vote_score}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatDate(resource.created_at)}
                            </span>
                          </div>
                          <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => updateParams('page', String(currentPage - 1))}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Forrige
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => updateParams('page', String(pageNum))}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => updateParams('page', String(currentPage + 1))}
                >
                  Næste
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Results count */}
            <p className="text-center text-sm text-muted-foreground mt-4">
              Viser {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} af {totalCount} ressourcer
            </p>
          </>
        )}
      </div>
    </Layout>
  )
}

export default ResourceBrowsePage
