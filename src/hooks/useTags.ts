import { useState, useEffect } from 'react'
import { tables } from '../lib/supabase'
import type { Tag } from '../types'

// Fallback tags hvis database ikke er tilgængelig
const fallbackTags: Tag[] = [
  { id: 'tag-1', name: 'baby', slug: 'baby', created_at: new Date().toISOString() },
  { id: 'tag-2', name: 'småbørn', slug: 'smaboern', created_at: new Date().toISOString() },
  { id: 'tag-3', name: 'teenagere', slug: 'teenagere', created_at: new Date().toISOString() },
  { id: 'tag-4', name: 'motion', slug: 'motion', created_at: new Date().toISOString() },
  { id: 'tag-5', name: 'mad', slug: 'mad', created_at: new Date().toISOString() },
  { id: 'tag-6', name: 'søvn', slug: 'soevn', created_at: new Date().toISOString() },
  { id: 'tag-7', name: 'disciplin', slug: 'disciplin', created_at: new Date().toISOString() },
  { id: 'tag-8', name: 'kommunikation', slug: 'kommunikation', created_at: new Date().toISOString() },
  { id: 'tag-9', name: 'leg', slug: 'leg', created_at: new Date().toISOString() },
  { id: 'tag-10', name: 'udendørs', slug: 'udendoers', created_at: new Date().toISOString() },
  { id: 'tag-11', name: 'indendørs', slug: 'indendoers', created_at: new Date().toISOString() },
  { id: 'tag-12', name: 'kreativitet', slug: 'kreativitet', created_at: new Date().toISOString() },
  { id: 'tag-13', name: 'læring', slug: 'laering', created_at: new Date().toISOString() },
  { id: 'tag-14', name: 'sport', slug: 'sport', created_at: new Date().toISOString() },
  { id: 'tag-15', name: 'musik', slug: 'musik', created_at: new Date().toISOString() },
]

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTags() {
      try {
        setLoading(true)
        
        // Tjek om Supabase miljøvariabler er konfigureret
        const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && 
                                  import.meta.env.VITE_SUPABASE_ANON_KEY &&
                                  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'

        if (!hasSupabaseConfig) {
          console.warn('Supabase not configured, using fallback tags')
          setTags(fallbackTags)
          setLoading(false)
          return
        }

        const { data, error } = await tables.tags()
          .select('*')
          .order('name')

        if (error) {
          console.error('Error fetching tags:', error)
          console.warn('Using fallback tags due to database error')
          setTags(fallbackTags)
          setError('Bruger backup tags')
          return
        }

        setTags(data && data.length > 0 ? data : fallbackTags)
      } catch (err) {
        console.error('Error fetching tags:', err)
        console.warn('Using fallback tags due to network error')
        setTags(fallbackTags)
        setError('Bruger backup tags')
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [])

  return { tags, loading, error }
}