import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  ExternalLink,
  Heart,
  Clock,
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
  Loader2,
  SearchX,
  Filter,
  X,
  Tag as TagIcon,
  Sparkles
} from 'lucide-react'
import { api, Resource, ResourceType, Category, Tag } from '@/lib/api'
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

const ITEMS_PER_PAGE = 12

export function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [popularTags, setPopularTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Get values from URL
  const query = searchParams.get('q') || ''
  const currentCategory = searchParams.get('category') || ''
  const currentType = searchParams.get('type') || ''
  const currentTag = searchParams.get('tag') || ''
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  // Initialize search input from URL
  useEffect(() => {
    setSearchInput(query)
  }, [query])

  // Fetch categories and tags
  useEffect(() => {
    async function fetchFilters() {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          api.getCategories(),
          api.getTags({ limit: 10 })
        ])
        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data)
        }
        if (tagsRes.success && tagsRes.data) {
          setPopularTags(tagsRes.data)
        }
      } catch (error) {
        console.error('Failed to fetch filters:', error)
      }
    }
    fetchFilters()
  }, [])

  // Fetch search results
  useEffect(() => {
    async function fetchResults() {
      if (!query || query.length < 2) {
        setResources([])
        setTotalCount(0)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const response = await api.searchResources({
          q: query,
          category: currentCategory || undefined,
          type: currentType || undefined,
          tag: currentTag || undefined,
          limit: ITEMS_PER_PAGE,
          offset: (currentPage - 1) * ITEMS_PER_PAGE
        })

        if (response.success && response.data) {
          setResources(response.data)
          setTotalCount(response.meta?.count || response.data.length)
        }
      } catch (error) {
        console.error('Failed to search resources:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query, currentCategory, currentType, currentTag, currentPage])

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

  const clearFilters = () => {
    const newParams = new URLSearchParams()
    if (query) newParams.set('q', query)
    setSearchParams(newParams)
  }

  const hasActiveFilters = currentCategory || currentType || currentTag

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim().length >= 2) {
      setSearchParams({ q: searchInput.trim() })
    }
  }

  const updatePage = (page: number) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', String(page))
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
          <h1 className="text-display-md mb-2">Søgeresultater</h1>
          {query && (
            <p className="text-muted-foreground text-lg">
              {loading ? 'Søger...' : `${totalCount} resultater for "${query}"`}
            </p>
          )}
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Søg efter ressourcer..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              disabled={searchInput.trim().length < 2}
            >
              Søg
            </Button>
          </div>
          {searchInput.length > 0 && searchInput.length < 2 && (
            <p className="text-sm text-muted-foreground mt-2">
              Indtast mindst 2 tegn for at søge
            </p>
          )}
        </form>

        {/* Filter Toggle Button */}
        {query && (
          <div className="mb-6">
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtre
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {[currentCategory, currentType, currentTag].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && query && (
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6 mb-6 animate-bounce-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Category Filter */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold mb-2 text-muted-foreground">
                  <Filter className="w-4 h-4" />
                  Kategori
                </label>
                <select
                  value={currentCategory}
                  onChange={(e) => updateParams('category', e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">Alle kategorier</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold mb-2 text-muted-foreground">
                  <Sparkles className="w-4 h-4" />
                  Type
                </label>
                <select
                  value={currentType}
                  onChange={(e) => updateParams('type', e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">Alle typer</option>
                  {Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag Filter */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold mb-2 text-muted-foreground">
                  <TagIcon className="w-4 h-4" />
                  Tag
                </label>
                <select
                  value={currentTag}
                  onChange={(e) => updateParams('tag', e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">Alle tags</option>
                  {popularTags.map((tag) => (
                    <option key={tag.id} value={tag.name}>
                      {tag.name} {tag.resource_count && `(${tag.resource_count})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="w-4 h-4 mr-1" />
                Ryd filtre
              </Button>
            )}
          </div>
        )}

        {/* Active Filters Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Aktive filtre:</span>
            {currentCategory && (
              <Badge variant="secondary" className="gap-1.5 pr-1.5">
                {categories.find(c => c.slug === currentCategory)?.name}
                <button
                  onClick={() => updateParams('category', '')}
                  className="ml-1 p-0.5 hover:bg-foreground/10 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {currentType && (
              <Badge variant="secondary" className="gap-1.5 pr-1.5">
                {RESOURCE_TYPE_LABELS[currentType as ResourceType]}
                <button
                  onClick={() => updateParams('type', '')}
                  className="ml-1 p-0.5 hover:bg-foreground/10 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {currentTag && (
              <Badge variant="secondary" className="gap-1.5 pr-1.5">
                <TagIcon className="w-3 h-3" />
                {currentTag}
                <button
                  onClick={() => updateParams('tag', '')}
                  className="ml-1 p-0.5 hover:bg-foreground/10 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* No Query State */}
        {!loading && !query && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Søg efter ressourcer</h3>
            <p className="text-muted-foreground">
              Indtast et søgeord ovenfor for at finde relevante ressourcer
            </p>
          </div>
        )}

        {/* Empty Results State */}
        {!loading && query && resources.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-primary/10 flex items-center justify-center">
              <SearchX className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Ingen resultater fundet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Vi fandt ingen ressourcer der matcher "{query}"
              {hasActiveFilters && " med de valgte filtre"}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                className="mb-4"
                onClick={clearFilters}
              >
                <X className="w-4 h-4 mr-2" />
                Ryd filtre og prøv igen
              </Button>
            )}
            <div className="space-y-3 text-sm text-muted-foreground mb-8">
              <p className="font-medium">Tips til bedre søgeresultater:</p>
              <ul className="space-y-1">
                <li>Tjek stavningen af dine søgeord</li>
                <li>Prøv med andre eller færre søgeord</li>
                <li>Brug mere generelle termer</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchInput('')
                  setSearchParams({})
                }}
              >
                Ryd søgning
              </Button>
              <Button asChild variant="accent">
                <Link to={`/submit?title=${encodeURIComponent(query)}`}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Del en ressource om "{query}"
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Results Grid */}
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
                  onClick={() => updatePage(currentPage - 1)}
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
                        onClick={() => updatePage(pageNum)}
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
                  onClick={() => updatePage(currentPage + 1)}
                >
                  Næste
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Results count */}
            <p className="text-center text-sm text-muted-foreground mt-4">
              Viser {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} af {totalCount} resultater
            </p>
          </>
        )}
      </div>
    </Layout>
  )
}

export default SearchResultsPage
