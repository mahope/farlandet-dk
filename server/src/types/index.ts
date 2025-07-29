export interface Resource {
  id: number
  title: string
  description?: string
  url?: string
  type: 'link' | 'pdf' | 'article' | 'podcast' | 'tip' | 'book' | 'video' | 'movie' | 'tv_series'
  category_id?: number
  status: 'pending' | 'approved' | 'rejected'
  votes: number
  submitted_by?: string
  created_at: Date
  approved_at?: Date
  approved_by?: string
  category?: Category
  tags?: Tag[]
}

export interface Category {
  id: number
  name: string
  description?: string
  created_at: Date
}

export interface Tag {
  id: number
  name: string
  created_at: Date
}

export interface ResourceWithDetails extends Resource {
  category: Category | null
  tags: Tag[]
}

export interface AdminUser {
  id: number
  email: string
  created_at: Date
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

export interface UpdateResourceRequest {
  title?: string
  description?: string
  url?: string
  type?: Resource['type']
  category_id?: number
  status?: Resource['status']
  tags?: string[]
}