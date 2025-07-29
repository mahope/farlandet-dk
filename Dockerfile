# Use Node.js 20 LTS
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for both frontend and backend
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production=false
RUN cd server && npm ci --only=production=false

# Copy source code
COPY . .

# Build both frontend and backend
RUN npm run build:prod
RUN cd server && npm run build

# Production stage
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/package.json ./server/package.json
COPY --from=builder /app/start-production.js ./
COPY --from=builder /app/health-check.js ./
COPY --from=builder /app/package.json ./

# Set environment variables
ENV NODE_ENV=production

# Expose port (use PORT env var or default to 3001)
EXPOSE ${PORT:-3001}

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node health-check.js

# Start the application using the production script
CMD ["node", "start-production.js"]