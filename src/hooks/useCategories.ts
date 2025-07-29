import { useState, useEffect } from 'react'
import { api, type Category } from '../lib/api'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await api.getCategories()
        
        if (response.success && response.data) {
          setCategories(response.data)
          setError(null)
        } else {
          setError(response.error || 'Failed to load categories')
        }
      } catch (err) {
        setError('Failed to load categories')
        console.error('Error fetching categories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}