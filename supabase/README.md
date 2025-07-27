# Database Schema and Migrations

This directory contains the database schema, migrations, and seed data for the Danish Fathers Directory.

## Files Overview

### Migrations
- `001_initial_schema.sql` - Creates all database tables, indexes, and constraints
- `002_rls_policies.sql` - Implements Row Level Security policies for data protection
- `003_functions.sql` - Creates database functions and triggers for complex operations

### Seed Data
- `seed.sql` - Initial categories and tags in Danish

## Database Schema

### Tables
- **categories** - Resource categories (Forældreskab, Sundhed, etc.)
- **tags** - Flexible tagging system for resources
- **user_profiles** - Extended user information (linked to Supabase auth.users)
- **resources** - Main content table with moderation workflow
- **resource_tags** - Many-to-many relationship between resources and tags
- **votes** - User voting system for resources
- **comments** - User comments on resources

### Key Features

#### Row Level Security (RLS)
- Public read access to approved resources
- User-specific access to own submissions
- Moderator/admin access to all content
- Secure voting and commenting for authenticated users

#### Database Functions
- `get_random_resource()` - Returns a random approved resource with full details
- `get_resources_with_details()` - Advanced search and filtering with pagination
- `increment_view_count()` - Safely increment resource view counts
- Automatic vote score calculation via triggers
- Automatic user profile creation on signup

#### Security Features
- UUID primary keys for better security
- Proper foreign key constraints
- Input validation via CHECK constraints
- Automatic timestamp management
- Full-text search capabilities

## Usage

### Running Migrations
```bash
# Apply all migrations
supabase db reset

# Or apply individual migrations
supabase db push
```

### Seeding Data
```bash
# Run seed data
supabase db seed
```

### Testing the Schema
```sql
-- Test random resource function
SELECT * FROM get_random_resource();

-- Test search function
SELECT * FROM get_resources_with_details(
    search_query := 'forældreskab',
    limit_count := 10
);

-- Test view count increment
SELECT increment_view_count('your-resource-uuid-here');
```

## Security Considerations

1. **Row Level Security** - All tables have RLS enabled with appropriate policies
2. **User Roles** - Three-tier role system (user, moderator, admin)
3. **Content Moderation** - All resources require approval before public visibility
4. **Input Validation** - Database-level constraints prevent invalid data
5. **Audit Trail** - Timestamps and user tracking for all operations

## Performance Optimizations

1. **Indexes** - Strategic indexes on frequently queried columns
2. **Full-text Search** - GIN index for efficient text search
3. **Efficient Queries** - Optimized functions for complex operations
4. **Proper Relationships** - Foreign keys with appropriate cascade rules