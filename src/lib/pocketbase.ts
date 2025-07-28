import PocketBase from 'pocketbase'

// Initialize PocketBase client
export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090')

// Disable auto cancellation
pb.autoCancellation(false)

// PocketBase Collection Names
export const Collections = {
  USERS: 'users',
  CATEGORIES: 'categories', 
  TAGS: 'tags',
  RESOURCES: 'resources',
  RESOURCE_TAGS: 'resource_tags',
  VOTES: 'votes',
  COMMENTS: 'comments'
} as const

// Type definitions for PocketBase records
export interface BaseRecord {
  id: string
  created: string
  updated: string
}

export interface UserRecord extends BaseRecord {
  email: string
  username?: string
  role: 'user' | 'moderator' | 'admin'
  emailVisibility?: boolean
  verified?: boolean
}

export interface CategoryRecord extends BaseRecord {
  name: string
  description?: string
  slug: string
  color: string
}

export interface TagRecord extends BaseRecord {
  name: string
  slug: string
}

export interface ResourceRecord extends BaseRecord {
  title: string
  description?: string
  url?: string
  file?: string // File field - returns filename
  resource_type: 'link' | 'pdf' | 'article' | 'podcast' | 'tip' | 'book' | 'video' | 'movie' | 'tv_series'
  category?: string // Relation ID
  submitter_email?: string
  submitter?: string // Relation ID
  status: 'pending' | 'approved' | 'rejected'
  vote_score: number
  view_count: number
  rejection_reason?: string
  metadata?: Record<string, any>
  
  // Expanded relations (when using expand parameter)
  expand?: {
    category?: CategoryRecord
    submitter?: UserRecord
    'resource_tags(resource)'?: ResourceTagRecord[]
    'votes(resource)'?: VoteRecord[]
    'comments(resource)'?: CommentRecord[]
  }
}

export interface ResourceTagRecord extends BaseRecord {
  resource: string // Relation ID
  tag: string // Relation ID
  
  // Expanded relations
  expand?: {
    resource?: ResourceRecord
    tag?: TagRecord
  }
}

export interface VoteRecord extends BaseRecord {
  user: string // Relation ID
  resource: string // Relation ID
  vote_type: 'up' | 'down'
  
  // Expanded relations
  expand?: {
    user?: UserRecord
    resource?: ResourceRecord
  }
}

export interface CommentRecord extends BaseRecord {
  resource: string // Relation ID
  user: string // Relation ID
  content: string
  is_deleted: boolean
  
  // Expanded relations
  expand?: {
    resource?: ResourceRecord
    user?: UserRecord
  }
}

// Helper functions for common operations

export class PocketBaseAPI {
  
  // Authentication
  static async signIn(email: string, password: string) {
    return await pb.collection(Collections.USERS).authWithPassword(email, password)
  }

  static async signUp(email: string, password: string, passwordConfirm: string, username?: string) {
    const data = {
      email,
      password,
      passwordConfirm,
      username: username || undefined,
      role: 'user' as const
    }
    return await pb.collection(Collections.USERS).create(data)
  }

  static signOut() {
    pb.authStore.clear()
  }

  static getCurrentUser(): UserRecord | null {
    return pb.authStore.model as UserRecord | null
  }

  static isAuthenticated(): boolean {
    return pb.authStore.isValid
  }

  // Categories
  static async getCategories() {
    return await pb.collection(Collections.CATEGORIES).getFullList<CategoryRecord>({
      sort: 'name'
    })
  }

  static async createCategory(data: Omit<CategoryRecord, keyof BaseRecord>) {
    return await pb.collection(Collections.CATEGORIES).create<CategoryRecord>(data)
  }

  // Tags
  static async getTags() {
    return await pb.collection(Collections.TAGS).getFullList<TagRecord>({
      sort: 'name'
    })
  }

  static async createTag(data: Omit<TagRecord, keyof BaseRecord>) {
    return await pb.collection(Collections.TAGS).create<TagRecord>(data)
  }

  // Resources
  static async getResources(page = 1, limit = 50, filter = '', expand = 'category,submitter') {
    return await pb.collection(Collections.RESOURCES).getList<ResourceRecord>(page, limit, {
      filter,
      expand,
      sort: '-created'
    })
  }

  static async getApprovedResources(page = 1, limit = 50, expand = 'category') {
    return await pb.collection(Collections.RESOURCES).getList<ResourceRecord>(page, limit, {
      filter: 'status = "approved"',
      expand,
      sort: '-created'
    })
  }

  static async getResourceById(id: string, expand = 'category,submitter,resource_tags(resource).tag') {
    return await pb.collection(Collections.RESOURCES).getOne<ResourceRecord>(id, {
      expand
    })
  }

  static async createResource(data: Omit<ResourceRecord, keyof BaseRecord | 'vote_score' | 'view_count'>) {
    return await pb.collection(Collections.RESOURCES).create<ResourceRecord>(data)
  }

  static async updateResource(id: string, data: Partial<ResourceRecord>) {
    return await pb.collection(Collections.RESOURCES).update<ResourceRecord>(id, data)
  }

  static async deleteResource(id: string) {
    return await pb.collection(Collections.RESOURCES).delete(id)
  }

  static async getRandomResource() {
    const resources = await pb.collection(Collections.RESOURCES).getList<ResourceRecord>(1, 1, {
      filter: 'status = "approved"',
      expand: 'category',
      sort: '@random'
    })
    return resources.items[0] || null
  }

  // Resource Tags
  static async addTagToResource(resourceId: string, tagId: string) {
    return await pb.collection(Collections.RESOURCE_TAGS).create<ResourceTagRecord>({
      resource: resourceId,
      tag: tagId
    })
  }

  static async removeTagFromResource(resourceId: string, tagId: string) {
    const records = await pb.collection(Collections.RESOURCE_TAGS).getFullList<ResourceTagRecord>({
      filter: `resource = "${resourceId}" && tag = "${tagId}"`
    })
    
    if (records.length > 0) {
      return await pb.collection(Collections.RESOURCE_TAGS).delete(records[0].id)
    }
  }

  // Votes
  static async voteOnResource(resourceId: string, voteType: 'up' | 'down') {
    const userId = pb.authStore.model?.id
    if (!userId) throw new Error('Must be authenticated to vote')

    // Check for existing vote
    const existingVotes = await pb.collection(Collections.VOTES).getFullList<VoteRecord>({
      filter: `user = "${userId}" && resource = "${resourceId}"`
    })

    if (existingVotes.length > 0) {
      // Update existing vote
      return await pb.collection(Collections.VOTES).update<VoteRecord>(existingVotes[0].id, {
        vote_type: voteType
      })
    } else {
      // Create new vote
      return await pb.collection(Collections.VOTES).create<VoteRecord>({
        user: userId,
        resource: resourceId,
        vote_type: voteType
      })
    }
  }

  static async removeVote(resourceId: string) {
    const userId = pb.authStore.model?.id
    if (!userId) throw new Error('Must be authenticated to remove vote')

    const votes = await pb.collection(Collections.VOTES).getFullList<VoteRecord>({
      filter: `user = "${userId}" && resource = "${resourceId}"`
    })

    if (votes.length > 0) {
      return await pb.collection(Collections.VOTES).delete(votes[0].id)
    }
  }

  // Comments
  static async getComments(resourceId: string, page = 1, limit = 50) {
    return await pb.collection(Collections.COMMENTS).getList<CommentRecord>(page, limit, {
      filter: `resource = "${resourceId}" && is_deleted = false`,
      expand: 'user',
      sort: 'created'
    })
  }

  static async createComment(resourceId: string, content: string) {
    const userId = pb.authStore.model?.id
    if (!userId) throw new Error('Must be authenticated to comment')

    return await pb.collection(Collections.COMMENTS).create<CommentRecord>({
      resource: resourceId,
      user: userId,
      content,
      is_deleted: false
    })
  }

  static async updateComment(commentId: string, content: string) {
    return await pb.collection(Collections.COMMENTS).update<CommentRecord>(commentId, {
      content
    })
  }

  static async deleteComment(commentId: string) {
    return await pb.collection(Collections.COMMENTS).update<CommentRecord>(commentId, {
      is_deleted: true
    })
  }

  // File helpers
  static getFileUrl(record: ResourceRecord, filename?: string): string {
    if (!record.file && !filename) return ''
    return pb.files.getUrl(record, filename || record.file || '')
  }

  // Search
  static async searchResources(query: string, page = 1, limit = 50) {
    const filter = `status = "approved" && (title ~ "${query}" || description ~ "${query}")`
    return await pb.collection(Collections.RESOURCES).getList<ResourceRecord>(page, limit, {
      filter,
      expand: 'category',
      sort: '-created'
    })
  }
}

export default pb