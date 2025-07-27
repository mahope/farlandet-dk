import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Resource, Category, Tag } from '../types/index'
import { ResourceList } from '../components/resource/ResourceList'
import { MasonryGrid } from '../components/resource/MasonryGrid'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useCategories } from '../hooks/useCategories'
import { useTags } from '../hooks/useTags'
import { useSEO } from '../hooks/useSEO'
import { tables } from '../lib/supabase'

type ViewMode = 'grid' | 'list'

export function ResourcesPage() {
  const navigate = useNavigate()
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedResourceType, setSelectedResourceType] = useState<string>('')
  
  const { categories } = useCategories()
  const { tags } = useTags()

  // Resource types with Danish labels
  const resourceTypes = [
    { value: '', label: 'Alle typer' },
    { value: 'link', label: '🔗 Links' },
    { value: 'article', label: '📰 Artikler' },
    { value: 'podcast', label: '🎧 Podcasts' },
    { value: 'video', label: '🎥 Videoer' },
    { value: 'book', label: '📚 Bøger' },
    { value: 'pdf', label: '📄 PDF\'er' },
    { value: 'tip', label: '💡 Tips' },
    { value: 'movie', label: '🍿 Film' },
    { value: 'tv_series', label: '📺 TV-serier' }
  ]

  useSEO({
    title: 'Alle Ressourcer - Farlandet.dk',
    description: 'Gennemse alle ressourcer delt af danske fædre. Find podcasts, artikler, tips, bøger og meget mere organiseret efter kategorier og tags.',
    keywords: ['fædre ressourcer', 'forældreskab tips', 'danske far blogs', 'podcasts for fædre', 'forældreguides'],
    url: 'https://farlandet.dk/resources',
  })

  // Fetch resources
  useEffect(() => {
    async function fetchResources() {
      try {
        setLoading(true)
        const { data, error } = await tables.resources()
          .select(`
            *,
            category:categories(*),
            tags:resource_tags(tag:tags(*))
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching resources:', error)
          return
        }

        // Transform the data to match our types
        const transformedResources = data?.map(resource => ({
          ...resource,
          tags: resource.tags?.map(rt => rt.tag).filter(Boolean) || []
        })) || []

        setResources(transformedResources)
        setFilteredResources(transformedResources)
      } catch (error) {
        console.error('Error fetching resources:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [])

  // Filter resources based on search and filters
  useEffect(() => {
    let filtered = resources

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(query) ||
        resource.description?.toLowerCase().includes(query) ||
        resource.tags?.some(tag => tag.name.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(resource => resource.category_id === selectedCategory)
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(resource =>
        resource.tags?.some(tag => selectedTags.includes(tag.id))
      )
    }

    // Resource type filter
    if (selectedResourceType) {
      filtered = filtered.filter(resource => resource.resource_type === selectedResourceType)
    }

    setFilteredResources(filtered)
  }, [resources, searchQuery, selectedCategory, selectedTags, selectedResourceType])

  // Group resources by category for masonry view
  const resourcesByCategory = React.useMemo(() => {
    const grouped: Record<string, Resource[]> = {}
    
    categories.forEach(category => {
      grouped[category.id] = filteredResources.filter(
        resource => resource.category_id === category.id
      )
    })
    
    return grouped
  }, [categories, filteredResources])

  const handleVote = async (resourceId: string, voteType: 'up' | 'down') => {
    // TODO: Implement voting
    console.log('Vote:', resourceId, voteType)
  }

  const handleViewDetails = (resource: Resource) => {
    navigate(`/resource/${resource.id}`)
  }

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category.id === selectedCategory ? '' : category.id)
    setViewMode('list')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Alle Ressourcer</h1>
        <p className="text-muted-foreground">
          Udforsk alle godkendte ressourcer fra fællesskabet
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="flex gap-4">
          <Input
            placeholder="Søg efter ressourcer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              size="sm"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              size="sm"
            >
              Liste
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Kategorier</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('')}
                size="sm"
              >
                Alle kategorier
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id === selectedCategory ? '' : category.id)}
                  size="sm"
              style={{
                backgroundColor: selectedCategory === category.id ? category.color : undefined,
                borderColor: category.color,
                color: selectedCategory === category.id ? 'white' : category.color
              }}
            >
              {category.name}
            </Button>
          ))}
            </div>
          </div>

          {/* Resource Type Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Ressource typer</label>
            <div className="flex flex-wrap gap-2">
              {resourceTypes.map(type => (
                <Button
                  key={type.value}
                  variant={selectedResourceType === type.value ? 'default' : 'outline'}
                  onClick={() => setSelectedResourceType(type.value)}
                  size="sm"
                  className="text-sm"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedCategory || selectedTags.length > 0 || selectedResourceType) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Aktive filtre:</span>
            {searchQuery && (
              <span className="bg-muted px-2 py-1 rounded">
                Søgning: "{searchQuery}"
              </span>
            )}
            {selectedCategory && (
              <span className="bg-muted px-2 py-1 rounded">
                Kategori: {categories.find(c => c.id === selectedCategory)?.name}
              </span>
            )}
            {selectedResourceType && (
              <span className="bg-muted px-2 py-1 rounded">
                Type: {resourceTypes.find(t => t.value === selectedResourceType)?.label}
              </span>
            )}
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('')
                setSelectedTags([])
                setSelectedResourceType('')
              }}
            >
              Ryd alle
            </Button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Viser {filteredResources.length} af {resources.length} ressourcer
        </p>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <MasonryGrid
          categories={categories}
          resourcesByCategory={resourcesByCategory}
          loading={loading}
          onVote={handleVote}
          onViewDetails={handleViewDetails}
          onViewCategory={handleViewCategory}
        />
      ) : (
        <ResourceList
          resources={filteredResources}
          loading={loading}
          onVote={handleVote}
          onViewDetails={handleViewDetails}
          emptyMessage="Ingen ressourcer matcher dine filtre"
          className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        />
      )}
    </div>
  )
}