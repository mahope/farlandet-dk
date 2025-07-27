import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { useAuth } from '../contexts/AuthContext'
import { useSEO } from '../hooks/useSEO'
import { tables } from '../lib/supabase'
import { useSupabaseFallback } from '../hooks/useSupabaseFallback'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { SupabaseDebug } from '../components/debug/SupabaseDebug'
import type { Resource } from '../types'

export function HomePage() {
  const fallback = useSupabaseFallback()
  const [allResources, setAllResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [loadingResources, setLoadingResources] = useState(true)
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('')
  const [useFallback, setUseFallback] = useState(false)

  // Quick resource type filters for homepage
  const quickFilters = [
    { value: '', label: 'Alle', icon: '📋' },
    { value: 'podcast', label: 'Podcasts', icon: '🎧' },
    { value: 'article', label: 'Artikler', icon: '📰' },
    { value: 'video', label: 'Videoer', icon: '🎥' },
    { value: 'book', label: 'Bøger', icon: '📚' },
    { value: 'tip', label: 'Tips', icon: '💡' }
  ]

  useSEO({
    title: 'Farlandet.dk - Danmarks fællesskab for fædre og ressourcer',
    description: 'Danmarks førende fællesskab for fædre. Del og find værdifulde ressourcer, podcasts, artikler, tips og meget mere. Bliv en del af vores støttende netværk af danske fædre.',
    keywords: ['danske fædre', 'forældreskab', 'fædres fællesskab', 'ressourcer til fædre', 'dansk familieliv', 'far tips', 'forældreskab danmark'],
    url: 'https://farlandet.dk/',
    type: 'website'
  })

  // Fetch all resources
  useEffect(() => {
    async function fetchAllResources() {
      try {
        setLoadingResources(true)
        
        // Try fallback first if Supabase SDK is having issues
        if (useFallback || fallback.error) {
          console.log('Using fallback API...')
          try {
            const data = await fallback.getResources()
            
            if (data && data.length > 0) {
              console.log(`✅ Fallback API loaded ${data.length} resources`)
              const transformedResources = data.map((resource: any) => ({
                ...resource,
                tags: resource.tags?.map((rt: any) => rt.tag).filter(Boolean) || [],
                category: resource.category || undefined
              })) as Resource[]
              setAllResources(transformedResources)
              setFilteredResources(transformedResources)
            } else {
              console.warn('⚠️ Fallback API returned empty result')
              setAllResources([])
              setFilteredResources([])
            }
            return
          } catch (fallbackError) {
            console.error('❌ Fallback API failed:', fallbackError)
            // Continue to try SDK as last resort
          }
        }

        // Try normal Supabase SDK first with timeout
        try {
          console.log('🔄 Trying Supabase SDK...')
          const sdkPromise = tables.resources()
            .select(`
              *,
              category:categories(*),
              tags:resource_tags(tag:tags(*))
            `)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('SDK timeout after 8 seconds')), 8000)
          )

          const { data, error } = await Promise.race([sdkPromise, timeoutPromise]) as any

          if (error) {
            console.error('❌ SDK Error fetching resources, trying fallback:', error)
            setUseFallback(true)
            return // This will trigger useEffect again with fallback
          }

          // Transform data to match types
          if (data && data.length > 0) {
            console.log(`✅ SDK loaded ${data.length} resources successfully`)
            const transformedResources = data.map(resource => ({
              ...resource,
              tags: resource.tags?.map((rt: any) => rt.tag).filter(Boolean) || [],
              category: resource.category || undefined
            })) as Resource[]
            setAllResources(transformedResources)
            setFilteredResources(transformedResources)
          } else {
            console.warn('⚠️ SDK returned empty result')
            setAllResources([])
            setFilteredResources([])
          }
        } catch (sdkError) {
          console.error('❌ SDK failed with exception, using fallback:', sdkError)
          setUseFallback(true)
          return // This will trigger useEffect again with fallback
        }
      } catch (error) {
        console.error('Error fetching resources:', error)
        setAllResources([])
        setFilteredResources([])
      } finally {
        setLoadingResources(false)
      }
    }

    fetchAllResources()
  }, [useFallback, fallback])

  // Filter resources by type
  useEffect(() => {
    if (selectedTypeFilter) {
      const filtered = allResources.filter(resource => resource.resource_type === selectedTypeFilter)
      setFilteredResources(filtered)
    } else {
      setFilteredResources(allResources)
    }
  }, [allResources, selectedTypeFilter])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Velkommen til Farlandet.dk
        </h1>
        <p className="text-lg text-muted-foreground">
          Danmarks førende fællesskab hvor fædre deler ressourcer, tips og erfaringer
        </p>
      </div>

      {/* All Resources Section */}
      <div className="mt-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Alle Ressourcer</h2>
          <p className="text-muted-foreground mb-6">
            Udforsk alle ressourcer fra vores fællesskab af danske fædre
          </p>
          
          {/* Quick filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {quickFilters.map(filter => (
              <Button
                key={filter.value}
                variant={selectedTypeFilter === filter.value ? 'default' : 'outline'}
                onClick={() => setSelectedTypeFilter(filter.value)}
                size="sm"
                className="text-sm"
              >
                {filter.icon} {filter.label}
              </Button>
            ))}
          </div>
          
          {selectedTypeFilter && (
            <p className="text-sm text-muted-foreground">
              Viser {filteredResources.length} {quickFilters.find(f => f.value === selectedTypeFilter)?.label.toLowerCase()} ressourcer
            </p>
          )}
        </div>

        {loadingResources ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text="Henter ressourcer..." />
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredResources.map((resource) => (
              <Link 
                key={resource.id} 
                to={`/resource/${resource.id}`}
                className="border rounded-lg p-6 bg-card hover:shadow-lg transition-shadow cursor-pointer block"
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {resource.resource_type === 'podcast' && '🎧'}
                      {resource.resource_type === 'article' && '📰'}
                      {resource.resource_type === 'book' && '📚'}
                      {resource.resource_type === 'video' && '🎥'}
                      {resource.resource_type === 'tip' && '💡'}
                      {resource.resource_type === 'pdf' && '📄'}
                      {resource.resource_type === 'link' && '🔗'}
                      {resource.resource_type === 'movie' && '🍿'}
                      {resource.resource_type === 'tv_series' && '📺'}
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
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {resource.title}
                  </h3>
                  {resource.description && (
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {resource.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {resource.vote_score > 0 && (
                      <span className="text-sm text-green-600 font-medium">
                        +{resource.vote_score}
                      </span>
                    )}
                    {resource.tags && resource.tags.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {resource.tags.slice(0, 2).map((tag: any) => tag.name).join(', ')}
                        {resource.tags.length > 2 && '...'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(resource.created_at).toLocaleDateString('da-DK')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
            <p className="text-muted-foreground mb-4">
              Ingen ressourcer fundet. Prøv en anden filter eller kom tilbage senere.
            </p>
          </div>
        )}
      </div>

      {/* Debug component - remove in production */}
      {import.meta.env.DEV && <SupabaseDebug />}
    </div>
  )
}