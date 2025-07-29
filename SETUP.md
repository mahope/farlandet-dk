# Farlandet.dk - Setup Guide

## Overview

Farlandet.dk is a community platform for Danish fathers to share resources including links, podcasts, PDFs, articles, tips and tricks. The platform is built with:

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **Authentication**: JWT-based admin authentication
- **Deployment**: Nixpacks-compatible (Railway, Render, etc.)

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   React SPA     │────▶│  Express API    │
│   (Port 5173)   │     │   (Port 3001)   │
└─────────────────┘     └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │   PostgreSQL    │
                        │    Database     │
                        └─────────────────┘
```

## Prerequisites

- Node.js 20+ (required for Vite 7)
- PostgreSQL 12+
- npm or yarn

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/mahope/farlandet-dk.git
cd farlandet-dk
```

### 2. Install dependencies

```bash
npm install
```

### 3. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE farlandet;
```

### 4. Environment Configuration

Copy the example environment files:

```bash
# Frontend environment
cp .env.example .env

# Backend environment
cp server/.env.example server/.env
```

Configure the environment variables:

**Frontend (.env)**:
```env
# API Configuration
VITE_API_URL=http://localhost:3001/api
```

**Backend (server/.env)**:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=farlandet
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT Secret (generate a secure random string)
JWT_SECRET=your_jwt_secret_here_change_in_production

# API Base URL
API_BASE_URL=http://localhost:3001
```

### 5. Start Development Servers

Run both frontend and backend:

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Database Schema

The database automatically initializes on first run with these tables:

- **categories**: Resource categories (e.g., "Bøger", "Podcasts")
- **resources**: Main content table with moderation workflow
- **tags**: Flexible tagging system
- **resource_tags**: Many-to-many relationship
- **admin_users**: Admin authentication

## Admin Setup

### Creating the First Admin User

1. Start the backend server
2. The database will auto-initialize
3. Use the API to create an admin:

```bash
curl -X POST http://localhost:3001/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your-secure-password"
  }'
```

Note: The `/setup-admin` endpoint only works when no admin users exist.

### Admin Dashboard

Access the admin dashboard at: http://localhost:5173/admin/login

Features:
- Resource moderation (approve/reject submissions)
- View statistics
- Manage categories and tags

## API Endpoints

### Public Endpoints
- `GET /api/resources` - List approved resources
- `GET /api/resources/:id` - Get resource details
- `GET /api/categories` - List categories
- `GET /api/tags` - List tags
- `POST /api/resources` - Submit resource (queued for moderation)

### Admin Endpoints (require authentication)
- `POST /api/auth/login` - Admin login
- `GET /api/admin/resources/pending` - List pending resources
- `PUT /api/admin/resources/:id/approve` - Approve resource
- `PUT /api/admin/resources/:id/reject` - Reject resource
- `GET /api/admin/stats` - Dashboard statistics

## Production Deployment

### Build for Production

```bash
npm run build:prod
```

This creates:
- Frontend build in `dist/`
- Backend remains in `server/`

### Deployment Configuration

The project includes `nixpacks.toml` for easy deployment:

```toml
providers = ["node"]

[variables]
NODE_ENV = "production"
NIXPACKS_NODE_VERSION = "20"

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build:prod"]

[start]
cmd = "npx serve -s dist -l ${PORT:-3000}"
```

### Environment Variables for Production

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secure random string for JWT signing
- `PORT` - Port for the web server

## Development Commands

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend

# Building
npm run build            # Build frontend
npm run build:server     # Build backend
npm run build:prod       # Build both for production

# Testing
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once

# Code Quality
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript checks
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `server/.env`
- Verify database exists: `psql -U postgres -c "\l"`

### Build Errors
- Ensure Node.js 20+ is installed: `node --version`
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist server/dist`

### Admin Login Issues
- Check JWT_SECRET is set in `server/.env`
- Ensure at least one admin user exists
- Check browser console for API errors

## Project Structure

```
.
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── contexts/          # React contexts (auth)
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── lib/               # Utilities and helpers
│   └── types/             # TypeScript definitions
├── server/                # Backend Express application
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── scripts/       # Database scripts
│   │   └── types/         # TypeScript types
│   └── .env.example       # Backend environment template
├── public/                # Static assets
├── dist/                  # Production frontend build
├── .env.example          # Frontend environment template
├── nixpacks.toml         # Deployment configuration
├── package.json          # Project dependencies
└── vite.config.ts        # Vite configuration
```

## Security Notes

- Never commit `.env` files
- Use strong JWT secrets in production
- Enable HTTPS in production
- Keep dependencies updated
- Use environment-specific CORS settings