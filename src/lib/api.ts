const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    limit: number
    offset: number
    count: number
  }
}

export type ResourceType = 'link' | 'pdf' | 'article' | 'podcast' | 'tip' | 'book' | 'video' | 'movie' | 'tv_series'

export interface Resource {
  id: number
  title: string
  description?: string
  url?: string
  resource_type: ResourceType
  type?: ResourceType // alias for compatibility
  category_id?: number
  status: 'pending' | 'approved' | 'rejected'
  vote_score: number
  votes?: number // alias
  view_count?: number
  submitter_email?: string
  submitted_by?: string
  created_at: string
  updated_at?: string
  approved_at?: string
  approved_by?: string
  // Joined fields from database
  category_name?: string
  category_slug?: string
  category_color?: string
  tags?: string[]
}

export interface Category {
  id: number
  name: string
  description?: string
  slug: string
  color: string
  resource_count?: number
  created_at: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  resource_count?: number
  created_at: string
}

export interface CreateResourceRequest {
  title: string
  description?: string
  url?: string
  type?: Resource['type']
  category_id?: number
  submitted_by?: string
  tags?: string[]
}

export interface AdminUser {
  id: string
  email: string
  name: string
  createdAt: string
  lastLogin?: string
}

export interface AdminDashboard {
  stats: {
    pending: number
    approved: number
    rejected: number
    total: number
    categories: number
    tags: number
    admins: number
  }
  recentResources: Resource[]
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Resources
  async getResources(params: {
    category?: string
    type?: string
    tag?: string
    sort?: 'newest' | 'popular' | 'oldest'
    limit?: number
    offset?: number
  } = {}): Promise<ApiResponse<Resource[]>> {
    const searchParams = new URLSearchParams()

    if (params.category) searchParams.append('category', params.category)
    if (params.type) searchParams.append('type', params.type)
    if (params.tag) searchParams.append('tag', params.tag)
    if (params.sort) searchParams.append('sort', params.sort)
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.offset) searchParams.append('offset', params.offset.toString())

    const query = searchParams.toString()
    return this.request<Resource[]>(`/resources${query ? `?${query}` : ''}`)
  }

  async getResource(id: number): Promise<ApiResponse<Resource>> {
    return this.request<Resource>(`/resources/${id}`)
  }

  async searchResources(params: {
    q: string
    category?: string
    type?: string
    tag?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<Resource[]>> {
    const searchParams = new URLSearchParams()

    searchParams.append('q', params.q)
    if (params.category) searchParams.append('category', params.category)
    if (params.type) searchParams.append('type', params.type)
    if (params.tag) searchParams.append('tag', params.tag)
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.offset) searchParams.append('offset', params.offset.toString())

    return this.request<Resource[]>(`/resources/search?${searchParams.toString()}`)
  }

  async getCategoryResources(slug: string, params: {
    sort?: 'newest' | 'popular' | 'oldest'
    limit?: number
    offset?: number
  } = {}): Promise<ApiResponse<{ category: Category; resources: Resource[] }>> {
    const searchParams = new URLSearchParams()

    if (params.sort) searchParams.append('sort', params.sort)
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.offset) searchParams.append('offset', params.offset.toString())

    const query = searchParams.toString()
    return this.request<{ category: Category; resources: Resource[] }>(`/categories/${slug}/resources${query ? `?${query}` : ''}`)
  }

  async createResource(data: CreateResourceRequest): Promise<ApiResponse<Resource>> {
    return this.request<Resource>('/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateResource(id: number, data: Partial<CreateResourceRequest>): Promise<ApiResponse<Resource>> {
    return this.request<Resource>(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteResource(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/resources/${id}`, {
      method: 'DELETE',
    })
  }

  async voteResource(id: number, type: 'up' | 'down'): Promise<ApiResponse<Resource>> {
    return this.request<Resource>(`/resources/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    })
  }

  // Categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request<Category[]>('/categories')
  }

  async getCategory(id: number): Promise<ApiResponse<Category>> {
    return this.request<Category>(`/categories/${id}`)
  }

  async createCategory(data: { name: string; description?: string }): Promise<ApiResponse<Category>> {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCategory(id: number, data: { name?: string; description?: string }): Promise<ApiResponse<Category>> {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/categories/${id}`, {
      method: 'DELETE',
    })
  }

  // Tags
  async getTags(params: { limit?: number } = {}): Promise<ApiResponse<Tag[]>> {
    const searchParams = new URLSearchParams()
    if (params.limit) searchParams.append('limit', params.limit.toString())
    const query = searchParams.toString()
    return this.request<Tag[]>(`/tags${query ? `?${query}` : ''}`)
  }

  async searchTags(params: { q?: string; limit?: number } = {}): Promise<ApiResponse<Tag[]>> {
    const searchParams = new URLSearchParams()
    if (params.q) searchParams.append('q', params.q)
    if (params.limit) searchParams.append('limit', params.limit.toString())
    const query = searchParams.toString()
    return this.request<Tag[]>(`/tags/search${query ? `?${query}` : ''}`)
  }

  // Related resources
  async getRelatedResources(id: number, params: { limit?: number } = {}): Promise<ApiResponse<Resource[]>> {
    const searchParams = new URLSearchParams()
    if (params.limit) searchParams.append('limit', params.limit.toString())
    const query = searchParams.toString()
    return this.request<Resource[]>(`/resources/${id}/related${query ? `?${query}` : ''}`)
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ user: AdminUser; token: string }>> {
    return this.request<{ user: AdminUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    })
  }

  async getCurrentUser(token: string): Promise<ApiResponse<AdminUser>> {
    return this.request<AdminUser>('/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async changePassword(token: string, currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  // Admin endpoints
  async getAdminDashboard(token: string): Promise<ApiResponse<AdminDashboard>> {
    return this.request<AdminDashboard>('/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async getAdminResources(token: string, params: {
    status?: string
    limit?: number
    offset?: number
  } = {}): Promise<ApiResponse<Resource[]>> {
    const searchParams = new URLSearchParams()
    
    if (params.status) searchParams.append('status', params.status)
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.offset) searchParams.append('offset', params.offset.toString())

    const query = searchParams.toString()
    return this.request<Resource[]>(`/admin/resources${query ? `?${query}` : ''}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async moderateResource(token: string, id: number, status: 'approved' | 'rejected'): Promise<ApiResponse<Resource>> {
    return this.request<Resource>(`/admin/resources/${id}/moderate`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })
  }

  async deleteAdminResource(token: string, id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/admin/resources/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ message: string; timestamp: string }>> {
    return this.request<{ message: string; timestamp: string }>('/health')
  }
}

export const api = new ApiClient()
export default api