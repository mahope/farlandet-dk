import { useState, useEffect } from 'react'
import { api, type Resource } from '../lib/api'

export function useResources(status: 'approved' | 'pending' | 'all' = 'approved') {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true)
        const response = await api.getResources({
          status: status === 'all' ? undefined : status,
          limit: 50
        })
        
        if (response.success && response.data) {
          setResources(response.data)
          setError(null)
        } else {
          setError(response.error || 'Failed to load resources')
        }
      } catch (err) {
        setError('Failed to load resources')
        console.error('Error fetching resources:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [status])

  const voteResource = async (id: number, type: 'up' | 'down') => {
    try {
      const response = await api.voteResource(id, type)
      
      if (response.success && response.data) {
        setResources(prev => 
          prev.map(resource => 
            resource.id === id ? response.data! : resource
          )
        )
      }
    } catch (err) {
      console.error('Error voting on resource:', err)
    }
  }

  return { resources, loading, error, voteResource }
}

export function useResource(id: number) {
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true)
        const response = await api.getResource(id)
        
        if (response.success && response.data) {
          setResource(response.data)
          setError(null)
        } else {
          setError(response.error || 'Resource not found')
        }
      } catch (err) {
        setError('Failed to load resource')
        console.error('Error fetching resource:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchResource()
    }
  }, [id])

  return { resource, loading, error }
}