# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Farlandet.dk** is a community-driven platform where Danish fathers share resources including links, podcasts, PDFs, articles, tips and tricks. Built with React frontend and Express backend with dual backend capability (PocketBase + Express).

## Development Commands

```bash
# Development
npm run dev                 # Start both Vite frontend and Express backend with nodemon
npm run build               # Build frontend for production
npm run start               # Start production server (serves built frontend + API)
npm run preview             # Preview production build with Vite

# Testing
npm run test                # Run Vitest in watch mode
npm run test:run            # Run tests once and exit
npm run test:ui             # Run Vitest with UI

# Code Quality
npm run lint                # ESLint with TypeScript support
```

## Tech Stack & Architecture

### Frontend
- **React 19** with TypeScript
- **Vite 5** for build tooling and fast HMR
- **Tailwind CSS 4** with `@tailwindcss/postcss`
- **Shadcn/ui** components in `src/components/ui/`
- **React Router 6** for client-side routing
- **React Hook Form** with Zod 4 validation
- **Zustand** for state management (planned)

### Backend & Data Strategy
- **Express.js** server (`server.js`) with in-memory storage for development
- **PocketBase** integration via `src/lib/pocketbase.ts` with type-safe API wrapper
- Security: Helmet, CORS, express-rate-limit, express-validator
- JWT authentication for admin users (bcrypt password hashing)
- HTML sanitization with DOMPurify

### Key Architectural Patterns

1. **Hybrid Backend Architecture**: Express server handles admin authentication and resource submission, with PocketBase integration available for data operations
2. **Dual Authentication**:
   - `PocketBaseAuthContext` for public user auth (social providers)
   - `AdminAuthContext` for admin JWT-based auth via Express
3. **Type-Safe API Layer**:
   - `PocketBaseAPI` class in `src/lib/pocketbase.ts` for PocketBase operations
   - `ApiClient` class in `src/lib/api.ts` for Express API calls
4. **Development Proxy**: Vite proxies `/api` requests to Express server (port 3002 in dev)
5. **Production Setup**: Express serves static files from `dist/` and handles API routes

## File Structure

```
src/
├── components/
│   ├── admin/              # Admin dashboard components
│   ├── auth/               # Authentication forms (planned)
│   ├── layout/             # Header, Footer, Layout
│   └── ui/                 # Shadcn/ui components
├── contexts/               # React contexts
│   ├── AdminAuthContext.tsx      # Admin JWT authentication
│   └── PocketBaseAuthContext.tsx # PocketBase auth (if used)
├── lib/
│   ├── api.ts              # Express API client
│   ├── pocketbase.ts       # PocketBase client & API wrapper
│   └── utils.ts            # Utility functions (cn helper)
├── pages/                  # Page components (HomePage, AdminPage, etc.)
├── types/
│   └── pocketbase.ts       # Type definitions for PocketBase records
└── App.tsx                 # Root component with auth providers

server.js                   # Express server with API routes
vite.config.ts              # Vite config with API proxy to localhost:3002
```

## Backend Architecture (server.js)

### In-Memory Storage (Development)
- Resources stored in `resources` array
- Mock admin users in `adminUsers` array
- Production should use real database

### API Endpoints

**Public Endpoints:**
- `GET /api/ping` - Health check
- `GET /api/health` - System status with uptime
- `GET /api/resources` - List approved resources only
- `GET /api/categories` - List categories
- `POST /api/resources` - Submit resource (queued as pending, rate-limited)

**Admin Endpoints (require JWT):**
- `POST /api/auth/login` - Admin login (returns JWT token)
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current admin user
- `GET /api/admin/dashboard` - Dashboard stats + recent resources
- `GET /api/admin/resources` - List resources with filters (status, limit, offset)
- `PUT /api/admin/resources/:id/moderate` - Approve/reject resource
- `DELETE /api/admin/resources/:id` - Delete resource

### Security Features
- **Rate Limiting**: General (100 req/15min), API (50 req/15min), Submit (10 req/hour in prod)
- **Input Validation**: express-validator with custom rules
- **HTML Sanitization**: DOMPurify for user-submitted content
- **Helmet**: Content Security Policy headers
- **JWT Auth**: Protected admin routes with token verification

## PocketBase Integration

The codebase includes comprehensive PocketBase types and API wrapper:

### Collections
- `users` - Auth with role (user|moderator|admin)
- `resources` - Main content with moderation workflow
- `categories` - Resource categories with color/slug
- `tags` - Flexible tagging system
- `resource_tags` - Junction table for many-to-many
- `votes` - Up/down voting by users
- `comments` - User comments with soft deletion

### Usage Pattern
```typescript
import { PocketBaseAPI } from '@/lib/pocketbase'

// Type-safe operations
const resources = await PocketBaseAPI.getApprovedResources(1, 20, 'category')
const resource = await PocketBaseAPI.createResource({
  title: 'Title',
  resource_type: 'link',
  status: 'pending'
})
```

## Admin Authentication Flow

1. Admin logs in via `POST /api/auth/login` with email/password
2. Server validates credentials (supports both plaintext for dev and bcrypt)
3. JWT token generated with 24h expiry
4. Frontend stores token and uses `AdminAuthContext`
5. Protected routes require `Authorization: Bearer <token>` header

**Development Admin:**
- Email: `admin@farlandet.dk`
- Password: `admin123`

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here

# Frontend (VITE_ prefix)
VITE_API_BASE_URL=http://localhost:3000
VITE_POCKETBASE_URL=http://127.0.0.1:8090
VITE_APP_NAME=Farlandet.dk

# Optional
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Resource Submission & Moderation

### Validation Rules (express-validator)
- **Title**: 5-255 chars, sanitized
- **Description**: 10-2000 chars, sanitized
- **URL**: Valid URL with protocol, blocked domains checked
- **Type**: One of: link, article, podcast, book, video, movie, tv_series, tip
- **Tags**: Optional, max 10 tags, each max 50 chars
- **Email**: Optional, validated email format

### Moderation Workflow
1. User submits resource → `status: 'pending'`
2. Admin views in dashboard at `/admin`
3. Admin approves → `status: 'approved'` (visible publicly)
4. Admin rejects → `status: 'rejected'`
5. Admin can delete resources entirely

## Component Patterns

### Shadcn/ui Components
- Located in `src/components/ui/`
- Use `cn()` utility for conditional classes
- Follow Radix UI patterns for accessibility

### Page Structure
- All pages in `src/pages/`
- Use Layout component for consistent header/footer
- Admin pages check auth via `useAdminAuth()` hook

## Development Workflow

### Running Locally
1. `npm install`
2. Copy `.env.example` to `.env`
3. `npm run dev` - Starts Vite (5173) + Express (3002)
4. Vite proxies API calls to Express automatically

### Building for Production
1. `npm run build` - Creates `dist/` folder
2. `npm run start` - Express serves static files + API
3. All routes serve `index.html` for React Router except `/api/*`

### Adding New Resource Types
1. Update `ResourceType` in `src/types/pocketbase.ts`
2. Add to validation in `server.js` line 448
3. Update form components
4. Update PocketBase schema (if using)

## Code Conventions

- **TypeScript**: Strict mode enabled, all props typed
- **Import Alias**: `@/` maps to `src/`
- **Styling**: Tailwind utility classes with `cn()` helper
- **Forms**: React Hook Form + Zod schemas
- **API Calls**: Use `api` client from `src/lib/api.ts`
- **Error Handling**: Error boundaries for React, try/catch for API

## Testing

- **Vitest** with React Testing Library
- **Playwright** for E2E tests
- **jsdom** environment for component tests
- Test files: `*.test.ts` or `*.test.tsx`

## Production Deployment

Uses **nixpacks.toml** configuration:
- Builds with `npm run build`
- Serves with `npx serve -s dist -l ${PORT}`
- Single-command deployment on Railway/Render

**Note**: Current in-memory storage is for development only. Production deployment requires migrating to persistent database (PostgreSQL or PocketBase).
