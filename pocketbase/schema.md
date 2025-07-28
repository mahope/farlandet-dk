# PocketBase Schema for Farlandet.dk

## Collections Schema

### 1. users (built-in collection with additional fields)
- **id**: string (auto-generated)
- **email**: string (required, unique)
- **username**: string (optional, unique)
- **role**: select (user, moderator, admin) - default: user
- **created**: datetime (auto)
- **updated**: datetime (auto)

### 2. categories
- **id**: string (auto-generated)
- **name**: string (required, max 100)
- **description**: text (optional)
- **slug**: string (required, unique, max 100)
- **color**: string (default: #3B82F6, max 7)
- **created**: datetime (auto)
- **updated**: datetime (auto)

### 3. tags
- **id**: string (auto-generated)
- **name**: string (required, unique, max 50)
- **slug**: string (required, unique, max 50)
- **created**: datetime (auto)

### 4. resources
- **id**: string (auto-generated)
- **title**: string (required, max 255)
- **description**: text (optional)
- **url**: url (optional, max 500)
- **file**: file (optional) - replaces file_path
- **resource_type**: select (link, pdf, article, podcast, tip, book, video, movie, tv_series)
- **category**: relation (categories, optional)
- **submitter_email**: email (optional, max 255)
- **submitter**: relation (users, optional)
- **status**: select (pending, approved, rejected) - default: pending
- **vote_score**: number (default: 0)
- **view_count**: number (default: 0)
- **rejection_reason**: text (optional)
- **metadata**: json (optional)
- **created**: datetime (auto)
- **updated**: datetime (auto)

### 5. resource_tags (many-to-many junction)
- **id**: string (auto-generated)
- **resource**: relation (resources, required, cascade delete)
- **tag**: relation (tags, required, cascade delete)
- **created**: datetime (auto)

### 6. votes
- **id**: string (auto-generated)
- **user**: relation (users, required, cascade delete)
- **resource**: relation (resources, required, cascade delete)
- **vote_type**: select (up, down)
- **created**: datetime (auto)
- **updated**: datetime (auto)

### 7. comments
- **id**: string (auto-generated)
- **resource**: relation (resources, required, cascade delete)
- **user**: relation (users, required, cascade delete)
- **content**: text (required)
- **is_deleted**: bool (default: false)
- **created**: datetime (auto)
- **updated**: datetime (auto)

## Collection Rules

### categories
- **List rule**: `@request.auth.id != ""`
- **View rule**: `@request.auth.id != ""`
- **Create rule**: `@request.auth.role = "admin"`
- **Update rule**: `@request.auth.role = "admin"`
- **Delete rule**: `@request.auth.role = "admin"`

### tags
- **List rule**: `@request.auth.id != ""`
- **View rule**: `@request.auth.id != ""`
- **Create rule**: `@request.auth.role = "admin" || @request.auth.role = "moderator"`
- **Update rule**: `@request.auth.role = "admin" || @request.auth.role = "moderator"`
- **Delete rule**: `@request.auth.role = "admin"`

### resources
- **List rule**: `status = "approved" || @request.auth.role = "admin" || @request.auth.role = "moderator"`
- **View rule**: `status = "approved" || @request.auth.role = "admin" || @request.auth.role = "moderator"`
- **Create rule**: `@request.auth.id != "" || @request.data.submitter_email != ""`
- **Update rule**: `@request.auth.role = "admin" || @request.auth.role = "moderator"`
- **Delete rule**: `@request.auth.role = "admin"`

### resource_tags
- **List rule**: `@request.auth.id != ""`
- **View rule**: `@request.auth.id != ""`
- **Create rule**: `@request.auth.role = "admin" || @request.auth.role = "moderator"`
- **Update rule**: `@request.auth.role = "admin" || @request.auth.role = "moderator"`
- **Delete rule**: `@request.auth.role = "admin" || @request.auth.role = "moderator"`

### votes
- **List rule**: `@request.auth.id != ""`
- **View rule**: `@request.auth.id != ""`
- **Create rule**: `@request.auth.id != "" && user = @request.auth.id`
- **Update rule**: `@request.auth.id != "" && user = @request.auth.id`
- **Delete rule**: `@request.auth.id != "" && user = @request.auth.id`

### comments
- **List rule**: `@request.auth.id != ""`
- **View rule**: `@request.auth.id != ""`
- **Create rule**: `@request.auth.id != "" && user = @request.auth.id`
- **Update rule**: `@request.auth.id != "" && user = @request.auth.id`
- **Delete rule**: `@request.auth.id != "" && user = @request.auth.id`

## Migration Notes

1. **File handling**: PocketBase uses file fields instead of file_path strings
2. **Authentication**: Built-in user collection with extended fields
3. **Relations**: PocketBase uses relation fields instead of foreign keys
4. **Enums**: Implemented as select fields with predefined options
5. **Auto-increment**: Not available, use auto-generated IDs
6. **Triggers**: Replaced with collection hooks or frontend logic
7. **Full-text search**: Built-in search functionality in PocketBase