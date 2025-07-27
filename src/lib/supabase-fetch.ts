// Fallback Supabase client using direct fetch
// Use this if the SDK has connection issues

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export class SupabaseFetch {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = `${SUPABASE_URL}/rest/v1`
    this.apiKey = SUPABASE_ANON_KEY
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'apikey': this.apiKey,
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async getCategories() {
    return this.request('/categories?select=*')
  }

  async getResources(limit = 10) {
    return this.request(`/resources?select=*,category:categories(*),tags:resource_tags(tag:tags(*))&status=eq.approved&order=created_at.desc&limit=${limit}`)
  }

  async getTags() {
    return this.request('/tags?select=*')
  }

  async createResource(resource: any) {
    return this.request('/resources', {
      method: 'POST',
      body: JSON.stringify(resource),
    })
  }
}

export const supabaseFetch = new SupabaseFetch()