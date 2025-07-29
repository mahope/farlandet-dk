# Farlandet API Server

Node.js/Express API server for Farlandet.dk community platform.

## Features

- PostgreSQL database with type-safe queries
- RESTful API for resources and categories
- Input validation with Zod
- CORS enabled for frontend integration
- Health check endpoint
- Database initialization and seeding scripts

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   ```

3. **Initialize database:**
   ```bash
   npm run db:init
   ```

4. **Seed with sample data:**
   ```bash
   npm run db:seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

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

# JWT Secret (for future auth implementation)
JWT_SECRET=your_jwt_secret_here
```

## API Endpoints

### Resources
- `GET /api/resources` - Get all resources (with optional filters)
- `GET /api/resources/:id` - Get single resource
- `POST /api/resources` - Create new resource
- `PUT /api/resources/:id` - Update resource (admin)
- `DELETE /api/resources/:id` - Delete resource (admin)
- `POST /api/resources/:id/vote` - Vote on resource

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Health
- `GET /api/health` - Health check

## Database Schema

### Categories
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Resources
```sql
CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT,
  type VARCHAR(50) DEFAULT 'link',
  category_id INTEGER REFERENCES categories(id),
  status VARCHAR(20) DEFAULT 'pending',
  votes INTEGER DEFAULT 0,
  submitted_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by VARCHAR(100)
);
```

### Tags
```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE resource_tags (
  resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:init` - Initialize database schema
- `npm run db:seed` - Seed database with sample data

## Production Deployment

1. Build the server:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Start the server:
   ```bash
   npm start
   ```

## Development

The server uses:
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Zod** - Input validation
- **TypeScript** - Type safety
- **tsx** - TypeScript execution for development