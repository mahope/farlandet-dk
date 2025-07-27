// ============================================================================
// Type Usage Examples - Demonstrates how to use the TypeScript interfaces
// ============================================================================

import type { 
  Resource, 
  ResourceSubmissionForm,
  SearchFilters,
  Database
} from './index'

import { 
  validateResourceSubmissionForm,
  isResource,
  convertDatabaseResource
} from './index'

import { tables } from '../lib/supabase'

// ============================================================================
// Example: Type-safe Supabase queries
// ============================================================================

export async function getResourcesExample() {
  // Type-safe query with proper return types
  const { data: resources, error } = await tables.resources()
    .select(`
      *,
      category:categories(*),
      tags:resource_tags(tag:tags(*)),
      submitter:user_profiles(*)
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching resources:', error)
    return []
  }

  // Type conversion from database format to application format
  return resources?.map(convertDatabaseResource) || []
}

export async function getCategoriesExample() {
  const { data: categories, error } = await tables.categories()
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return categories || []
}

// ============================================================================
// Example: Form validation with types
// ============================================================================

export function handleResourceSubmission(formData: ResourceSubmissionForm) {
  // Validate form data with type-safe validation
  const validation = validateResourceSubmissionForm(formData)
  
  if (!validation.isValid) {
    console.error('Form validation errors:', validation.errors)
    return { success: false, errors: validation.errors }
  }

  // Form data is now guaranteed to be valid
  console.log('Valid form data:', formData)
  return { success: true, data: formData }
}

// ============================================================================
// Example: Type guards for runtime safety
// ============================================================================

export function processResourceData(data: unknown) {
  if (isResource(data)) {
    // TypeScript now knows 'data' is a Resource
    console.log(`Processing resource: ${data.title}`)
    console.log(`Type: ${data.resource_type}`)
    console.log(`Status: ${data.status}`)
    return data
  } else {
    console.error('Invalid resource data received')
    return null
  }
}

// ============================================================================
// Example: Search with type-safe filters
// ============================================================================

export async function searchResourcesExample(filters: SearchFilters) {
  let query = tables.resources()
    .select(`
      *,
      category:categories(*),
      tags:resource_tags(tag:tags(*))
    `)
    .eq('status', 'approved')

  // Apply filters with type safety
  if (filters.query) {
    query = query.textSearch('title', filters.query)
  }

  if (filters.categoryIds && filters.categoryIds.length > 0) {
    query = query.in('category_id', filters.categoryIds)
  }

  if (filters.resourceTypes && filters.resourceTypes.length > 0) {
    query = query.in('resource_type', filters.resourceTypes)
  }

  // Apply sorting
  const sortBy = filters.sortBy || 'created_at'
  const sortOrder = filters.sortOrder === 'asc' ? { ascending: true } : { ascending: false }
  query = query.order(sortBy, sortOrder)

  const { data, error } = await query

  if (error) {
    console.error('Search error:', error)
    return { resources: [], totalCount: 0 }
  }

  return {
    resources: data?.map(convertDatabaseResource) || [],
    totalCount: data?.length || 0
  }
}

// ============================================================================
// Example: Type-safe database operations
// ============================================================================

export async function createResourceExample(resourceData: Database['public']['Tables']['resources']['Insert']) {
  const { data, error } = await tables.resources()
    .insert(resourceData)
    .select()
    .single()

  if (error) {
    console.error('Error creating resource:', error)
    return null
  }

  return convertDatabaseResource(data)
}

export async function updateResourceExample(
  id: string, 
  updates: Database['public']['Tables']['resources']['Update']
) {
  const { data, error } = await tables.resources()
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating resource:', error)
    return null
  }

  return convertDatabaseResource(data)
}

// ============================================================================
// Example: Component prop types
// ============================================================================

import type { ResourceItemProps, CategoryCardProps } from './index'

export function ResourceItemExample({ resource, showVoting = true, onVote }: ResourceItemProps) {
  // TypeScript ensures all required props are provided and have correct types
  return (
    <div>
      <h3>{resource.title}</h3>
      <p>{resource.description}</p>
      <span>Type: {resource.resource_type}</span>
      <span>Score: {resource.vote_score}</span>
      
      {showVoting && onVote && (
        <div>
          <button onClick={() => onVote(resource.id, 'up')}>Upvote</button>
          <button onClick={() => onVote(resource.id, 'down')}>Downvote</button>
        </div>
      )}
    </div>
  )
}

export function CategoryCardExample({ category, resources, maxResources = 5 }: CategoryCardProps) {
  const displayResources = resources.slice(0, maxResources)
  
  return (
    <div style={{ backgroundColor: category.color }}>
      <h2>{category.name}</h2>
      <p>{category.description}</p>
      
      <ul>
        {displayResources.map(resource => (
          <li key={resource.id}>
            <ResourceItemExample 
              resource={resource} 
              showVoting={false}
            />
          </li>
        ))}
      </ul>
      
      {resources.length > maxResources && (
        <p>+{resources.length - maxResources} more resources</p>
      )}
    </div>
  )
}

// ============================================================================
// Example: Error handling with types
// ============================================================================

export async function safeResourceFetch(id: string): Promise<Resource | null> {
  try {
    const { data, error } = await tables.resources()
      .select(`
        *,
        category:categories(*),
        tags:resource_tags(tag:tags(*)),
        submitter:user_profiles(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Database error:', error)
      return null
    }

    if (!data) {
      console.warn('Resource not found:', id)
      return null
    }

    // Validate the data structure before returning
    const resource = convertDatabaseResource(data)
    if (!isResource(resource)) {
      console.error('Invalid resource data structure')
      return null
    }

    return resource
  } catch (error) {
    console.error('Unexpected error:', error)
    return null
  }
}