# Farlandet.dk - Quick Setup Guide

Quick setup guide for getting the Farlandet.dk platform running locally.

## Prerequisites

1. **Node.js 20+** - [Download here](https://nodejs.org/)
2. **PostgreSQL** - [Download here](https://www.postgresql.org/download/)

## Quick Start

### 1. Create PostgreSQL Database

```bash
# Create database (replace with your postgres username if different)
createdb farlandet

# Alternative: Using psql
psql -U postgres -c "CREATE DATABASE farlandet;"
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install server dependencies and setup database
npm run setup
```

### 3. Configure Environment

```bash
# Copy example environment file
cp server/.env.example server/.env

# Edit server/.env with your database credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=farlandet
# DB_USER=postgres
# DB_PASSWORD=your_password_here
```

### 4. Start Development Servers

```bash
# Option 1: Start both frontend and backend together
npm run dev:full

# Option 2: Start separately
npm run dev           # Frontend (localhost:5173)
npm run dev:server    # Backend (localhost:3001)
```

## What Gets Set Up

### Database Schema
- **categories** - Resource categories (Forældreskab, Aktiviteter, etc.)
- **resources** - Main content with moderation workflow
- **tags** + **resource_tags** - Flexible tagging system
- **admin_users** - Simple admin authentication

### Sample Data
- 10 categories covering different aspects of fatherhood
- 8 sample resources (articles, podcasts, videos)
- Common tags for organizing content
- Default admin user for testing

### Default Admin Account
- **Email:** admin@farlandet.dk
- **Password:** admin123
- **Admin Panel:** http://localhost:5173/admin

⚠️ **Remember to change the admin password in production!**

## Manual Setup (if needed)

If the automatic setup fails, you can run steps manually:

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run db:init    # Create database schema
npm run db:seed    # Add sample data
npm run dev        # Start server
```

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_ctl status

# List databases
psql -l

# Test connection
psql -U postgres -d farlandet -c "SELECT version();"
```

### Reset Database
```bash
# Drop and recreate everything
dropdb farlandet && createdb farlandet
npm run setup
```

### Check Server Health
Visit http://localhost:3001/api/health to see database status.

## Next Steps

1. **Visit the site:** http://localhost:5173
2. **Submit a resource:** Test the public submission form
3. **Admin panel:** http://localhost:5173/admin (use admin@farlandet.dk / admin123)
4. **API endpoints:** http://localhost:3001/api/resources

## Development Workflow

- **Frontend:** React app runs on port 5173
- **Backend:** Express API runs on port 3001
- **Database:** PostgreSQL (default port 5432)
- **Hot reload:** Both frontend and backend support hot reload

The system automatically:
- Tests database connection on server start
- Creates schema if missing
- Seeds data if database is empty
- Provides helpful error messages

Ready to code! 🚀