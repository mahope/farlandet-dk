import { useState, useEffect } from 'react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Direct fetch implementation as fallback with timeout protection
async function fetchFromSupabase(endpoint: string, options: RequestInit = {}) {
  const url = `${SUPABASE_URL}/rest/v1${endpoint}`
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('Request timeout after 10 seconds')
    }
    throw error
  }
}

export function useSupabaseFallback() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Test connection on mount
  useEffect(() => {
    async function testConnection() {
      try {
        // Quick connectivity test
        await fetchFromSupabase('/categories?select=id&limit=1')
        setLoading(false)
      } catch (err: any) {
        console.error('Supabase fallback connection failed:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  const getCategories = async () => {
    return fetchFromSupabase('/categories?select=*')
  }

  const getResources = async (limit = 10) => {
    return fetchFromSupabase(`/resources?select=*,category:categories(*),tags:resource_tags(tag:tags(*))&status=eq.approved&order=created_at.desc&limit=${limit}`)
  }

  const getTags = async () => {
    return fetchFromSupabase('/tags?select=*')
  }

  const createResource = async (resource: any) => {
    return fetchFromSupabase('/resources', {
      method: 'POST',
      body: JSON.stringify(resource),
    })
  }

  return {
    loading,
    error,
    getCategories,
    getResources,
    getTags,
    createResource,
    isConnected: !error && !loading
  }
}