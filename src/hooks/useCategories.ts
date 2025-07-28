import { useState, useEffect } from 'react'
import { PocketBaseAPI } from '../lib/pocketbase'
import type { Category } from '../types/pocketbase'

// Fallback categorier hvis database ikke er tilgængelig
const fallbackCategories: Category[] = [
  {
    id: 'fallback-1',
    name: 'Forældreskab',
    description: 'Generelle råd og ressourcer om forældreskab',
    slug: 'foraeldre',
    color: '#3B82F6',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: 'fallback-2',
    name: 'Sundhed & Trivsel',
    description: 'Sundhed, motion og mental trivsel for fædre',
    slug: 'sundhed',
    color: '#10B981',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: 'fallback-3',
    name: 'Aktiviteter',
    description: 'Aktiviteter og oplevelser med børn',
    slug: 'aktiviteter',
    color: '#F59E0B',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: 'fallback-4',
    name: 'Uddannelse',
    description: 'Læringsressourcer og uddannelsesmateriale',
    slug: 'uddannelse',
    color: '#8B5CF6',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
]

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        
        // Tjek om PocketBase er tilgængeligt
        const hasPocketBaseConfig = import.meta.env.VITE_POCKETBASE_URL

        if (!hasPocketBaseConfig) {
          console.warn('PocketBase not configured, using fallback categories')
          setCategories(fallbackCategories)
          setLoading(false)
          return
        }

        const data = await PocketBaseAPI.getCategories()

        if (data && data.length > 0) {
          setCategories(data)
        } else {
          console.warn('Using fallback categories - no data from PocketBase')
          setCategories(fallbackCategories)
          setError('Bruger backup kategorier')
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        console.warn('Using fallback categories due to network error')
        setCategories(fallbackCategories)
        setError('Bruger backup kategorier')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}