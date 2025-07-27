// ============================================================================
// Type Guards and Type Conversion Utilities
// ============================================================================

// Define types locally to avoid circular imports
export type ResourceType = 'link' | 'pdf' | 'article' | 'podcast' | 'tip' | 'book' | 'video' | 'movie' | 'tv_series';
export type ResourceStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'user' | 'moderator' | 'admin';
export type VoteType = 'up' | 'down';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  color: string;
  created_at: string;
  updated_at: string;
  resourceCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  username: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  file_path: string | null;
  resource_type: ResourceType;
  category_id: string | null;
  submitter_email: string | null;
  submitter_id: string | null;
  status: ResourceStatus;
  vote_score: number;
  view_count: number;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  tags?: Tag[];
  submitter?: UserProfile;
  comments?: Comment[];
  user_vote?: Vote;
}

export interface Vote {
  id: string;
  user_id: string;
  resource_id: string;
  vote_type: VoteType;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
  resource?: Resource;
}

export interface Comment {
  id: string;
  resource_id: string;
  user_id: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
  resource?: Resource;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isResourceType(value: string): value is ResourceType {
  return ['link', 'pdf', 'article', 'podcast', 'tip', 'book', 'video', 'movie', 'tv_series'].includes(value)
}

export function isResourceStatus(value: string): value is ResourceStatus {
  return ['pending', 'approved', 'rejected'].includes(value)
}

export function isUserRole(value: string): value is UserRole {
  return ['user', 'moderator', 'admin'].includes(value)
}

export function isVoteType(value: string): value is VoteType {
  return ['up', 'down'].includes(value)
}

export function isResource(obj: any): obj is Resource {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    isResourceType(obj.resource_type) &&
    isResourceStatus(obj.status)
  )
}

export function isCategory(obj: any): obj is Category {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.slug === 'string'
  )
}

export function isTag(obj: any): obj is Tag {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.slug === 'string'
  )
}

export function isUserProfile(obj: any): obj is UserProfile {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    isUserRole(obj.role)
  )
}

export function isVote(obj: any): obj is Vote {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.resource_id === 'string' &&
    isVoteType(obj.vote_type)
  )
}

export function isComment(obj: any): obj is Comment {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.resource_id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.content === 'string'
  )
}

// ============================================================================
// Array Type Guards
// ============================================================================

export function isResourceArray(arr: any[]): arr is Resource[] {
  return Array.isArray(arr) && arr.every(isResource)
}

export function isCategoryArray(arr: any[]): arr is Category[] {
  return Array.isArray(arr) && arr.every(isCategory)
}

export function isTagArray(arr: any[]): arr is Tag[] {
  return Array.isArray(arr) && arr.every(isTag)
}

export function isCommentArray(arr: any[]): arr is Comment[] {
  return Array.isArray(arr) && arr.every(isComment)
}

// ============================================================================
// Type Conversion Utilities
// ============================================================================

export function parseResourceType(value: string | null | undefined): ResourceType | null {
  if (!value || !isResourceType(value)) {
    return null
  }
  return value
}

export function parseResourceStatus(value: string | null | undefined): ResourceStatus | null {
  if (!value || !isResourceStatus(value)) {
    return null
  }
  return value
}

export function parseUserRole(value: string | null | undefined): UserRole {
  if (!value || !isUserRole(value)) {
    return 'user'
  }
  return value
}

export function parseVoteType(value: string | null | undefined): VoteType | null {
  if (!value || !isVoteType(value)) {
    return null
  }
  return value
}

// ============================================================================
// Database Row to Application Type Converters
// ============================================================================

export function convertDatabaseResource(dbResource: any): Resource {
  return {
    id: dbResource.id,
    title: dbResource.title,
    description: dbResource.description,
    url: dbResource.url,
    file_path: dbResource.file_path,
    resource_type: dbResource.resource_type,
    category_id: dbResource.category_id,
    submitter_email: dbResource.submitter_email,
    submitter_id: dbResource.submitter_id,
    status: dbResource.status,
    vote_score: dbResource.vote_score || 0,
    view_count: dbResource.view_count || 0,
    rejection_reason: dbResource.rejection_reason,
    created_at: dbResource.created_at,
    updated_at: dbResource.updated_at,
    // Relations will be populated separately
    category: dbResource.category,
    tags: dbResource.tags || [],
    submitter: dbResource.submitter,
    comments: dbResource.comments || [],
    user_vote: dbResource.user_vote
  }
}

export function convertDatabaseCategory(dbCategory: any): Category {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    description: dbCategory.description,
    slug: dbCategory.slug,
    color: dbCategory.color || '#3B82F6',
    created_at: dbCategory.created_at,
    updated_at: dbCategory.updated_at,
    resourceCount: dbCategory.resource_count || 0
  }
}

export function convertDatabaseTag(dbTag: any): Tag {
  return {
    id: dbTag.id,
    name: dbTag.name,
    slug: dbTag.slug,
    created_at: dbTag.created_at
  }
}

export function convertDatabaseUserProfile(dbUser: any): UserProfile {
  return {
    id: dbUser.id,
    username: dbUser.username,
    role: parseUserRole(dbUser.role),
    created_at: dbUser.created_at,
    updated_at: dbUser.updated_at
  }
}

export function convertDatabaseVote(dbVote: any): Vote {
  return {
    id: dbVote.id,
    user_id: dbVote.user_id,
    resource_id: dbVote.resource_id,
    vote_type: dbVote.vote_type,
    created_at: dbVote.created_at,
    updated_at: dbVote.updated_at,
    user: dbVote.user,
    resource: dbVote.resource
  }
}

export function convertDatabaseComment(dbComment: any): Comment {
  return {
    id: dbComment.id,
    resource_id: dbComment.resource_id,
    user_id: dbComment.user_id,
    content: dbComment.content,
    is_deleted: dbComment.is_deleted || false,
    created_at: dbComment.created_at,
    updated_at: dbComment.updated_at,
    user: dbComment.user,
    resource: dbComment.resource
  }
}

// ============================================================================
// Utility Functions for Type Safety
// ============================================================================

export function assertIsResource(obj: any): asserts obj is Resource {
  if (!isResource(obj)) {
    throw new Error('Object is not a valid Resource')
  }
}

export function assertIsCategory(obj: any): asserts obj is Category {
  if (!isCategory(obj)) {
    throw new Error('Object is not a valid Category')
  }
}

export function assertIsTag(obj: any): asserts obj is Tag {
  if (!isTag(obj)) {
    throw new Error('Object is not a valid Tag')
  }
}

export function assertIsUserProfile(obj: any): asserts obj is UserProfile {
  if (!isUserProfile(obj)) {
    throw new Error('Object is not a valid UserProfile')
  }
}

// ============================================================================
// Safe Type Casting
// ============================================================================

export function safeParseResource(obj: any): Resource | null {
  try {
    if (isResource(obj)) {
      return obj
    }
    return null
  } catch {
    return null
  }
}

export function safeParseCategory(obj: any): Category | null {
  try {
    if (isCategory(obj)) {
      return obj
    }
    return null
  } catch {
    return null
  }
}

export function safeParseTag(obj: any): Tag | null {
  try {
    if (isTag(obj)) {
      return obj
    }
    return null
  } catch {
    return null
  }
}

export function safeParseUserProfile(obj: any): UserProfile | null {
  try {
    if (isUserProfile(obj)) {
      return obj
    }
    return null
  } catch {
    return null
  }
}