# TypeScript Types and Interfaces

This directory contains comprehensive TypeScript type definitions for the Danish Fathers Directory application.

## Files Overview

### `index.ts`
Main types file containing:
- **Core Data Models**: Resource, Category, Tag, UserProfile, Vote, Comment
- **API Response Types**: ApiResponse, PaginatedResponse, SearchResponse
- **Form Types**: ResourceSubmissionForm, LoginForm, RegisterForm, CommentForm
- **Component Props**: All component prop interfaces for type-safe React components
- **State Management**: AuthState, ResourcesState, UIState for Zustand stores
- **Utility Types**: Generic types for forms, validation, and async operations

### `database.ts`
Supabase-specific database types:
- **Database Schema**: Complete TypeScript representation of the Supabase database
- **Table Types**: Row, Insert, Update types for all database tables
- **Enum Types**: All database enums (user_role, resource_status, etc.)
- **Function Types**: Database function signatures
- **Type Helpers**: Utility types for easier database type usage

### `validation.ts`
Form validation schemas and utilities:
- **Validation Rules**: Centralized validation rules for all form fields
- **Validation Functions**: Individual field validators (email, password, etc.)
- **Form Validators**: Complete form validation functions
- **File Upload Config**: File type and size validation configurations
- **URL Validation**: Resource type-specific URL validation

### `guards.ts`
Type guards and conversion utilities:
- **Type Guards**: Runtime type checking functions (isResource, isCategory, etc.)
- **Array Type Guards**: Type guards for arrays of objects
- **Type Converters**: Database row to application type converters
- **Safe Parsing**: Error-safe type conversion functions
- **Type Assertions**: Assertion functions for type safety

### `examples.ts`
Usage examples demonstrating:
- Type-safe Supabase queries
- Form validation with types
- Type guards for runtime safety
- Search with type-safe filters
- Component prop usage
- Error handling with types

## Key Features

### 1. Database Type Safety
- Complete TypeScript representation of the Supabase database schema
- Type-safe queries with proper return types
- Insert/Update type safety for all database operations

### 2. Form Validation
- Comprehensive validation rules for all form fields
- Type-safe validation functions with proper error handling
- Resource type-specific validation (URLs, files, etc.)

### 3. Component Type Safety
- Prop interfaces for all React components
- Event handler type definitions
- State management type safety

### 4. Runtime Type Safety
- Type guards for validating data at runtime
- Safe type conversion functions
- Error handling with proper type checking

### 5. API Integration
- Response type definitions for all API calls
- Pagination and search result types
- Error response handling

## Usage Examples

### Type-safe Database Query
```typescript
import { tables } from '../lib/supabase'
import { convertDatabaseResource } from '../types'

const { data, error } = await tables.resources()
  .select('*, category:categories(*)')
  .eq('status', 'approved')

const resources = data?.map(convertDatabaseResource) || []
```

### Form Validation
```typescript
import { validateResourceSubmissionForm } from '../types'

const validation = validateResourceSubmissionForm(formData)
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors)
}
```

### Type Guards
```typescript
import { isResource } from '../types'

if (isResource(data)) {
  // TypeScript knows 'data' is a Resource
  console.log(data.title)
}
```

### Component Props
```typescript
import type { ResourceItemProps } from '../types'

function ResourceItem({ resource, onVote }: ResourceItemProps) {
  // All props are type-safe
  return <div>{resource.title}</div>
}
```

## Type Safety Benefits

1. **Compile-time Error Detection**: Catch type errors during development
2. **IntelliSense Support**: Better IDE autocomplete and suggestions
3. **Refactoring Safety**: Confident code changes with type checking
4. **Documentation**: Types serve as living documentation
5. **Runtime Safety**: Type guards prevent runtime errors
6. **API Contract**: Ensures frontend-backend type consistency

## Integration with Supabase

The types are designed to work seamlessly with Supabase:
- Database schema types match the actual database structure
- Type-safe client configuration
- Real-time subscription types
- Storage bucket types
- Authentication types

## Validation Strategy

The validation system provides:
- Field-level validation with specific error messages
- Form-level validation with comprehensive error reporting
- File upload validation with type and size checking
- URL validation specific to resource types
- Danish language error messages for user-facing validation