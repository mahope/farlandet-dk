# Deployment Guide for Farlandet.dk

## Dokploy Deployment

This project is configured for deployment on Dokploy using Nixpacks.

### Required Environment Variables

Set these environment variables in your Dokploy project:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=https://your-domain.com
NODE_ENV=production
PORT=3000
```

### Deployment Files

- `nixpacks.toml` - Nixpacks configuration for build and deployment
- `Dockerfile` - Alternative Docker configuration (backup)
- `.dockerignore` - Files to ignore during Docker build
- `.env.example` - Template for environment variables

### Build Process

1. **Install Phase**: Install Node.js dependencies and serve package
2. **Build Phase**: Build the React application for production
3. **Start Phase**: Serve the static files using `serve`

### Manual Deployment Commands

```bash
# Install dependencies
npm ci --only=production=false
npm install -g serve

# Build for production
npm run build:prod

# Start the application
npm start
```

### Port Configuration

The application runs on port 3000 by default. This can be configured via the `PORT` environment variable.

### Build Output

The production build creates optimized static files in the `dist/` directory:
- Minified and optimized JavaScript bundles
- CSS with Tailwind optimizations
- Static assets (images, fonts, etc.)

### Performance Notes

- The JavaScript bundle is approximately 583KB (169KB gzipped)
- Consider implementing code splitting for better performance
- Static files are served with appropriate caching headers via `serve`

### Troubleshooting

1. **Build Failures**: Check that all environment variables are set correctly
2. **Runtime Errors**: Verify Supabase configuration and URL accessibility
3. **Performance Issues**: Monitor bundle size and consider lazy loading components