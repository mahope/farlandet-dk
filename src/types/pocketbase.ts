// PocketBase Type Definitions for Farlandet.dk

export type UserRole = 'user' | 'moderator' | 'admin'
export type ResourceStatus = 'pending' | 'approved' | 'rejected'
export type ResourceType = 'link' | 'pdf' | 'article' | 'podcast' | 'tip' | 'book' | 'video' | 'movie' | 'tv_series'
export type VoteType = 'up' | 'down'

// Base PocketBase record interface
export interface PBRecord {
  id: string
  created: string
  updated: string
}

// User (extends built-in auth collection)
export interface User extends PBRecord {
  email: string
  username?: string
  role: UserRole
  emailVisibility?: boolean
  verified?: boolean
}

// Category
export interface Category extends PBRecord {
  name: string
  description?: string
  slug: string
  color: string
}

// Tag
export interface Tag extends PBRecord {
  name: string
  slug: string
}

// Resource
export interface Resource extends PBRecord {
  title: string
  description?: string
  url?: string
  file?: string
  resource_type: ResourceType
  category?: string // Relation ID
  submitter_email?: string
  submitter?: string // Relation ID
  status: ResourceStatus
  vote_score: number
  view_count: number
  rejection_reason?: string
  metadata?: Record<string, any>
  
  // Expanded relations
  expand?: {
    category?: Category
    submitter?: User
    tags?: Tag[]
  }
}

// Resource with expanded relations for display
export interface ResourceWithRelations extends Omit<Resource, 'category' | 'submitter'> {
  category?: Category | string
  submitter?: User | string
  tags?: Tag[]
  userVote?: VoteType | null
  totalVotes?: number
  commentCount?: number
}

// Resource Tag junction
export interface ResourceTag extends PBRecord {
  resource: string // Relation ID
  tag: string // Relation ID
  
  expand?: {
    resource?: Resource
    tag?: Tag
  }
}

// Vote
export interface Vote extends PBRecord {
  user: string // Relation ID
  resource: string // Relation ID
  vote_type: VoteType
  
  expand?: {
    user?: User
    resource?: Resource
  }
}

// Comment
export interface Comment extends PBRecord {
  resource: string // Relation ID
  user: string // Relation ID
  content: string
  is_deleted: boolean
  
  expand?: {
    resource?: Resource
    user?: User
  }
}

// Form submission types
export interface ResourceSubmission {
  title: string
  description?: string
  url?: string
  file?: File
  resource_type: ResourceType
  category?: string
  submitter_email?: string
  tags?: string[]
}

export interface CommentSubmission {
  content: string
}

export interface UserUpdate {
  username?: string
  email?: string
}

// API Response types
export interface PBListResult<T> {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
  items: T[]
}

// Auth types
export interface AuthData {
  token: string
  record: User
}

export interface SignUpData {
  email: string
  password: string
  passwordConfirm: string
  username?: string
}

export interface SignInData {
  email: string
  password: string
}

// Error types
export interface PBError {
  code: number
  message: string
  data?: Record<string, any>
}

// Filter and query types
export interface ResourceFilters {
  status?: ResourceStatus
  resource_type?: ResourceType
  category?: string
  submitter?: string
  search?: string
}

export interface QueryOptions {
  page?: number
  limit?: number
  sort?: string
  expand?: string
  filter?: string
}

// Utility types for form handling
export type CreateResourceData = Omit<Resource, keyof PBRecord | 'vote_score' | 'view_count' | 'status'>
export type UpdateResourceData = Partial<Omit<Resource, keyof PBRecord>>
export type CreateCategoryData = Omit<Category, keyof PBRecord>
export type UpdateCategoryData = Partial<Omit<Category, keyof PBRecord>>
export type CreateTagData = Omit<Tag, keyof PBRecord>
export type UpdateTagData = Partial<Omit<Tag, keyof PBRecord>>