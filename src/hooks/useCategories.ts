import { useState, useEffect } from 'react'
import { tables } from '../lib/supabase'
import type { Category } from '../types'

// Fallback categorier hvis database ikke er tilgængelig
const fallbackCategories: Category[] = [
  {
    id: 'fallback-1',
    name: 'Forældreskab',
    description: 'Generelle råd og ressourcer om forældreskab',
    slug: 'foraeldre',
    color: '#3B82F6',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-2',
    name: 'Sundhed & Trivsel',
    description: 'Sundhed, motion og mental trivsel for fædre',
    slug: 'sundhed',
    color: '#10B981',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-3',
    name: 'Aktiviteter',
    description: 'Aktiviteter og oplevelser med børn',
    slug: 'aktiviteter',
    color: '#F59E0B',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-4',
    name: 'Uddannelse',
    description: 'Læringsressourcer og uddannelsesmateriale',
    slug: 'uddannelse',
    color: '#8B5CF6',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
        
        // Tjek om Supabase miljøvariabler er konfigureret
        const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && 
                                  import.meta.env.VITE_SUPABASE_ANON_KEY &&
                                  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'

        if (!hasSupabaseConfig) {
          console.warn('Supabase not configured, using fallback categories')
          setCategories(fallbackCategories)
          setLoading(false)
          return
        }

        const { data, error } = await tables.categories()
          .select('*')
          .order('name')

        if (error) {
          console.error('Error fetching categories:', error)
          console.warn('Using fallback categories due to database error')
          setCategories(fallbackCategories)
          setError('Bruger backup kategorier')
          return
        }

        setCategories(data && data.length > 0 ? data : fallbackCategories)
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