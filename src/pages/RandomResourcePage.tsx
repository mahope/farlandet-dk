import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { ResourceCard } from '../components/resource/ResourceCard'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { tables } from '../lib/supabase'
import type { Resource } from '../types/index'
import { Shuffle, RefreshCw } from 'lucide-react'

export function RandomResourcePage() {
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRandomResource = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await tables.resources()
        .select(`
          *,
          category:categories(*),
          tags:resource_tags(tag:tags(*))
        `)
        .eq('status', 'approved')

      if (fetchError) {
        setError('Kunne ikke hente ressourcer')
        return
      }

      if (!data || data.length === 0) {
        setError('Ingen godkendte ressourcer fundet')
        return
      }

      // Select random resource
      const randomIndex = Math.floor(Math.random() * data.length)
      const randomResource = data[randomIndex]

      // Transform the data to match our types
      const transformedResource: Resource = {
        ...randomResource,
        tags: randomResource.tags?.map((rt: any) => rt.tag).filter(Boolean) || []
      }

      setResource(transformedResource)
    } catch (err) {
      setError('Der opstod en fejl ved hentning af tilfældig ressource')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRandomResource()
  }, [])

  const handleVote = async (resourceId: string, voteType: 'up' | 'down') => {
    console.log('Vote:', resourceId, voteType)
    // TODO: Implement voting
  }

  const handleViewDetails = (resource: Resource) => {
    console.log('View details:', resource)
    // TODO: Implement resource detail view
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Shuffle className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-3xl font-bold">Tilfældig Ressource</h1>
        </div>
        <p className="text-muted-foreground mb-6">
          Oplev noget nyt! Klik på "Ny tilfældig ressource" for at opdage en ressource fra vores samling.
        </p>
        
        <Button 
          onClick={fetchRandomResource} 
          disabled={loading}
          className="mb-8"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Henter...
            </>
          ) : (
            <>
              <Shuffle className="h-4 w-4 mr-2" />
              Ny tilfældig ressource
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      {loading && !resource && (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size={48} />
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Ingen ressource fundet</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={fetchRandomResource}>
            Prøv igen
          </Button>
        </div>
      )}

      {resource && !loading && (
        <div className="max-w-2xl mx-auto">
          <ResourceCard
            resource={resource}
            onVote={handleVote}
            onViewDetails={handleViewDetails}
            showVoting={true}
            className="shadow-lg"
          />
          
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground mb-4">
              Synes du godt om denne ressource? Del den med andre fædre!
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => window.open(`/resources?id=${resource.id}`, '_blank')}>
                Se detaljer
              </Button>
              <Button onClick={fetchRandomResource}>
                Find en anden
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-16 text-center p-6 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Mangler du en bestemt type ressource?</h3>
        <p className="text-muted-foreground mb-4">
          Hjælp med at udvide vores samling ved at bidrage med dine egne fund og anbefalinger.
        </p>
        <Button asChild>
          <a href="/submit">
            Bidrag med en ressource
          </a>
        </Button>
      </div>
    </div>
  )
}