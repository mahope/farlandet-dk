# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Farlandet.dk** - a community-driven platform where Danish fathers share resources including links, podcasts, PDFs, articles, tips and tricks. The project is built as a full-stack application with a React frontend and Node.js/Express backend, using PocketBase as the primary database solution.

## Development Commands

```bash
# Development
npm run dev                 # Start both frontend and backend servers
npm run dev:server          # Start only backend server
npm run dev:full            # Start frontend and backend concurrently

# Building
npm run build               # Build frontend with TypeScript compilation
npm run build:prod          # Build for production
npm run build:server        # Build backend server

# Testing
npm run test                # Run tests with Vitest in watch mode
npm run test:run            # Run tests once and exit
npm run test:ui             # Run tests with Vitest UI

# Code Quality
npm run lint                # ESLint with TypeScript support

# Database & Setup
npm run db:init             # Initialize database schema
npm run db:seed             # Seed database with sample data
npm run setup               # Complete server setup process

# Production
npm run start               # Start production frontend server
npm run start:server        # Start production backend server
npm run preview             # Preview production build
```

## Tech Stack & Architecture

### Frontend
- **React 19** with TypeScript
- **Vite 7** for build tooling and development
- **Tailwind CSS v4** with custom configuration
- **Shadcn/ui** components (stored in `src/components/ui/`)
- **React Router v7** for navigation
- **React Hook Form** with Zod validation
- **Zustand** for state management

### Backend & Data
- **PocketBase** as primary BaaS solution
- **Node.js + Express** server for additional API endpoints
- **PostgreSQL** database with admin authentication
- Type-safe PocketBase client with comprehensive API wrapper

### Key Architectural Decisions

1. **Dual Backend Strategy**: Uses PocketBase for main data operations with Express server for admin functions and additional processing
2. **Type-safe PocketBase Integration**: Custom `PocketBaseAPI` class in `src/lib/pocketbase.ts` provides type-safe database access
3. **Context-based Auth**: Both `PocketBaseAuthContext` and `AdminAuthContext` for different authentication flows
4. **Component-based Architecture**: Organized by feature with shared UI components from Shadcn/ui
5. **Full-stack TypeScript**: Comprehensive type system across frontend and backend

## File Structure & Key Conventions

```
src/
├── components/
│   ├── admin/              # Admin panel components
│   ├── layout/             # Header, Footer, Layout components  
│   └── ui/                 # Shadcn/ui components
├── contexts/               # React contexts (Auth systems)
├── hooks/                  # Custom React hooks
├── lib/                    # Core utilities and configurations
│   ├── pocketbase.ts       # Type-safe PocketBase API wrapper
│   └── api.ts             # Express API client
├── pages/                  # Page components
├── types/                  # TypeScript definitions
│   └── pocketbase.ts      # PocketBase-specific types
└── test/                   # Test setup and utilities

server/
├── src/
│   ├── config/            # Database configuration  
│   ├── routes/            # Express API routes
│   ├── services/          # Business logic services
│   └── scripts/           # Database management scripts
```

## Database Architecture

### PocketBase Collections
- `users` - User authentication and profiles with role-based access
- `resources` - Main content with moderation workflow (pending/approved/rejected)
- `categories` - Resource categorization system
- `tags` - Flexible tagging with many-to-many relationships
- `resource_tags` - Junction table for resource-tag relationships
- `votes` - Community voting system (up/down votes)
- `comments` - User comments with soft deletion

### Express/PostgreSQL Tables
- `admin_users` - Admin authentication separate from PocketBase
- Additional tables for admin-specific functionality

## Authentication Systems

### Dual Authentication Architecture
1. **PocketBase Auth** (`PocketBaseAuthContext`): Public user authentication with social providers
2. **Admin Auth** (`AdminAuthContext`): JWT-based admin authentication via Express API

### Usage Patterns
- Use `useAuth()` hook from PocketBase context for public features
- Use admin context for moderation and admin panel access
- Role-based access control: `user` | `moderator` | `admin`

## Development Patterns

### PocketBase Integration
```typescript
// Use the PocketBaseAPI class for type-safe operations
import { PocketBaseAPI } from '@/lib/pocketbase'

// Get resources with proper typing
const resources = await PocketBaseAPI.getApprovedResources(1, 20, 'category')

// Create resource with validation
const newResource = await PocketBaseAPI.createResource({
  title: 'Resource Title',
  resource_type: 'link',
  status: 'pending'
})
```

### Form Handling
- Use React Hook Form with Zod schemas for validation
- Forms located in `src/lib/validations/` directory
- Type-safe form submissions with PocketBase integration

### Component Development
- Follow Shadcn/ui patterns for new components
- Use `cn()` utility from `src/lib/utils.ts` for conditional styling
- Implement proper TypeScript interfaces for all props

## Testing Strategy

- **Vitest** with React Testing Library for component testing
- **Playwright** for end-to-end testing
- **jsdom** environment for browser simulation
- Test files use `*.test.ts` or `*.test.tsx` naming convention
- Comprehensive test coverage for hooks, components, and utilities

## Environment Configuration

### Frontend Environment Variables
```env
VITE_POCKETBASE_URL=http://127.0.0.1:8090
VITE_API_URL=http://localhost:3001/api
```

### Backend Environment Variables
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=farlandet
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
PORT=3001
NODE_ENV=development
```

## Code Quality & Conventions

- **TypeScript Strict Mode**: All code must pass strict TypeScript compilation
- **ESLint Configuration**: Uses modern ESLint with TypeScript support
- **Import Aliases**: Use `@/` for src directory imports
- **Component Exports**: Proper index.ts files for clean imports
- **Error Handling**: Comprehensive error boundaries and API error handling
- **File Upload**: Support for PDF and other file uploads via PocketBase

## Common Development Tasks

### Adding New Resource Types
1. Update `ResourceType` union in `src/types/pocketbase.ts`
2. Update form validation schemas
3. Add UI components for new type handling
4. Update PocketBase collection schema if needed

### Database Migrations
- PocketBase: Use admin UI for schema changes
- Express/PostgreSQL: Add migration scripts in `server/src/scripts/`

### Admin Features
- All admin functionality goes through Express API
- Use `AdminAuthContext` for authentication
- Admin routes protected with JWT middleware

This architecture supports the project's goal of being a comprehensive community platform while maintaining type safety and developer productivity.