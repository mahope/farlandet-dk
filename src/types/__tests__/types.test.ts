// ============================================================================
// Type Tests - Verify TypeScript interfaces and types work correctly
// ============================================================================

import type { 
  Resource, 
  Category, 
  Tag, 
  UserProfile, 
  Vote, 
  Comment,
  ResourceSubmissionForm,
  LoginForm,
  RegisterForm,
  SearchFilters
} from '../index'

import { 
  isResource, 
  isCategory, 
  isTag, 
  isUserProfile,
  validateLoginForm,
  validateRegisterForm,
  validateResourceSubmissionForm
} from '../index'

// ============================================================================
// Type Tests
// ============================================================================

describe('TypeScript Interface Tests', () => {
  test('Resource interface should have correct structure', () => {
    const mockResource: Resource = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Resource',
      description: 'Test description',
      url: 'https://example.com',
      file_path: null,
      resource_type: 'link',
      category_id: '123e4567-e89b-12d3-a456-426614174001',
      submitter_email: 'test@example.com',
      submitter_id: '123e4567-e89b-12d3-a456-426614174002',
      status: 'approved',
      vote_score: 5,
      view_count: 100,
      rejection_reason: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    expect(mockResource.id).toBe('123e4567-e89b-12d3-a456-426614174000')
    expect(mockResource.resource_type).toBe('link')
    expect(mockResource.status).toBe('approved')
  })

  test('Category interface should have correct structure', () => {
    const mockCategory: Category = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Category',
      description: 'Test description',
      slug: 'test-category',
      color: '#3B82F6',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    expect(mockCategory.name).toBe('Test Category')
    expect(mockCategory.slug).toBe('test-category')
  })

  test('UserProfile interface should have correct structure', () => {
    const mockUser: UserProfile = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      role: 'user',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    expect(mockUser.role).toBe('user')
    expect(mockUser.username).toBe('testuser')
  })
})

describe('Type Guard Tests', () => {
  test('isResource should correctly identify valid resources', () => {
    const validResource = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Resource',
      resource_type: 'link',
      status: 'approved'
    }

    const invalidResource = {
      id: 123, // Should be string
      title: 'Test Resource',
      resource_type: 'invalid_type',
      status: 'approved'
    }

    expect(isResource(validResource)).toBe(true)
    expect(isResource(invalidResource)).toBe(false)
  })

  test('isCategory should correctly identify valid categories', () => {
    const validCategory = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Category',
      slug: 'test-category'
    }

    const invalidCategory = {
      id: 123, // Should be string
      name: 'Test Category'
      // Missing slug
    }

    expect(isCategory(validCategory)).toBe(true)
    expect(isCategory(invalidCategory)).toBe(false)
  })
})

describe('Form Validation Tests', () => {
  test('validateLoginForm should validate correctly', () => {
    const validForm: LoginForm = {
      email: 'test@example.com',
      password: 'Password123'
    }

    const invalidForm: LoginForm = {
      email: 'invalid-email',
      password: '123' // Too short
    }

    const validResult = validateLoginForm(validForm)
    const invalidResult = validateLoginForm(invalidForm)

    expect(validResult.isValid).toBe(true)
    expect(invalidResult.isValid).toBe(false)
    expect(invalidResult.errors.email).toBeDefined()
    expect(invalidResult.errors.password).toBeDefined()
  })

  test('validateResourceSubmissionForm should validate correctly', () => {
    const validForm: ResourceSubmissionForm = {
      title: 'Test Resource Title',
      description: 'Test description',
      resourceType: 'link',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      tags: ['tag1', 'tag2'],
      url: 'https://example.com'
    }

    const invalidForm: ResourceSubmissionForm = {
      title: 'T', // Too short
      description: 'Test description',
      resourceType: 'link',
      categoryId: '', // Empty
      tags: [], // Empty
      url: 'invalid-url'
    }

    const validResult = validateResourceSubmissionForm(validForm)
    const invalidResult = validateResourceSubmissionForm(invalidForm)

    expect(validResult.isValid).toBe(true)
    expect(invalidResult.isValid).toBe(false)
    expect(invalidResult.errors.title).toBeDefined()
    expect(invalidResult.errors.categoryId).toBeDefined()
    expect(invalidResult.errors.tags).toBeDefined()
    expect(invalidResult.errors.url).toBeDefined()
  })
})

describe('Search Filter Types', () => {
  test('SearchFilters should allow partial filtering', () => {
    const filters: SearchFilters = {
      query: 'test search',
      categoryIds: ['cat1', 'cat2'],
      resourceTypes: ['link', 'pdf'],
      sortBy: 'created_at',
      sortOrder: 'desc'
    }

    expect(filters.query).toBe('test search')
    expect(filters.categoryIds).toHaveLength(2)
    expect(filters.resourceTypes).toContain('link')
    expect(filters.sortBy).toBe('created_at')
  })

  test('SearchFilters should work with minimal data', () => {
    const minimalFilters: SearchFilters = {
      query: 'test'
    }

    expect(minimalFilters.query).toBe('test')
    expect(minimalFilters.categoryIds).toBeUndefined()
  })
})