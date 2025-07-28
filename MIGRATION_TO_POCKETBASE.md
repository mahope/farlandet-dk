# Migration fra Supabase til PocketBase

## Oversigt

Dette dokument beskriver migrationen af Farlandet.dk fra Supabase til PocketBase.

## Ændringer

### 🔄 Backend Migration
- **Fra:** Supabase (PostgreSQL + Auth)
- **Til:** PocketBase (SQLite + Built-in Auth)

### 📦 Dependencies
- **Fjernet:** `@supabase/supabase-js`
- **Tilføjet:** `pocketbase`

### 🗃️ Database Schema
- **Collections:** Erstatter Supabase tabeller
- **Relations:** Bruger PocketBase relation fields
- **File Upload:** Integreret file handling i PocketBase
- **Authentication:** Built-in user collection

### 🔧 Kode Ændringer

#### Authentication Context
- **Gammel:** `src/contexts/AuthContext.tsx`
- **Ny:** `src/contexts/PocketBaseAuthContext.tsx`
- Bruger PocketBase auth store
- Simplere state management

#### Database Client
- **Gammel:** `src/lib/supabase.ts`
- **Ny:** `src/lib/pocketbase.ts`
- PocketBase API wrapper
- Type-safe operations

#### Type Definitions
- **Gammel:** `src/types/database.ts` (Supabase)
- **Ny:** `src/types/pocketbase.ts`
- PocketBase record types
- Simplified interfaces

### 🌐 Environment Variables
```bash
# Før
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Efter
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

## PocketBase Setup

### 1. Installation
```bash
# Download PocketBase binary fra https://pocketbase.io/docs/
# Eller brug Docker
docker run -d --name pocketbase -p 8090:8090 -v pb_data:/pb_data ghcr.io/muchobien/pocketbase:latest
```

### 2. Schema Configuration
Se `pocketbase/schema.md` for detaljeret schema definition.

**Collections at oprette:**
1. **users** (extend built-in)
   - Tilføj: `role` (select: user, moderator, admin)
   
2. **categories**
   - name, description, slug, color
   
3. **tags**
   - name, slug
   
4. **resources**
   - title, description, url, file, resource_type, category, status, etc.
   
5. **resource_tags** (junction)
   - resource, tag relations
   
6. **votes**
   - user, resource, vote_type
   
7. **comments**
   - resource, user, content, is_deleted

### 3. Collection Rules
Konfigurer adgangsregler for hver collection (se schema.md).

### 4. File Upload
PocketBase håndterer file uploads automatisk via file fields.

## Migration Script (Valgfri)

Hvis du har eksisterende data i Supabase:

```javascript
// migration-script.js
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

// Eksempel: Migrer kategorier
async function migrateCategories(supabaseData) {
  for (const category of supabaseData) {
    await pb.collection('categories').create({
      name: category.name,
      description: category.description,
      slug: category.slug,
      color: category.color
    })
  }
}
```

## Fordele ved PocketBase

### ✅ Simplicitet
- Single binary deployment
- Built-in admin dashboard
- Automatisk API generation

### ✅ Performance
- SQLite database (fast for read-heavy workloads)
- Lokale filer (ikke cloud dependencies)
- Real-time subscriptions

### ✅ Udvikling
- Lettere lokal udvikling
- Ingen cloud setup krævt
- Built-in file upload

### ✅ Hosting
- Deploy som single binary
- Mindre kompleksitet
- Docker support

## Deployment

### Docker Compose
```yaml
version: '3.8'
services:
  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    container_name: farlandet-pocketbase
    restart: unless-stopped
    command: ["--serve", "--http=0.0.0.0:8090", "--dir=/pb_data", "--publicDir=/pb_public"]
    ports:
      - "8090:8090"
    volumes:
      - pb_data:/pb_data
      - pb_public:/pb_public
    environment:
      - ENCRYPTION_KEY=your-32-char-encryption-key

volumes:
  pb_data:
  pb_public:
```

### Environment Variables
```bash
VITE_POCKETBASE_URL=https://your-domain.com:8090
```

## Test Plan

1. **Setup lokalt PocketBase**
2. **Opret schema** som beskrevet
3. **Test authentication** (admin login)
4. **Test resource visning** på homepage
5. **Test admin funktioner**

## Rollback Plan

Hvis migration skal rulles tilbage:
1. Skift environment variable tilbage til Supabase
2. Genaktiver gammel AuthContext i App.tsx
3. Revert HomePage til Supabase queries

## Status

✅ Dependencies opdateret
✅ PocketBase client oprettet  
✅ Authentication system konverteret
✅ Homepage opdateret til PocketBase
✅ Type definitions oprettet
✅ Environment variables opdateret
⏳ PocketBase setup og test