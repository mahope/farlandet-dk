# Simple Dockerfile for Farlandet.dk
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Build the frontend
RUN npm run build

# Expose port (Railway uses PORT env var)
EXPOSE $PORT

# Start the server
CMD ["node", "server.js"]