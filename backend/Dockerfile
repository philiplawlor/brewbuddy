# Backend - Production Dockerfile
# Optimized for production deployment

FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application
COPY dist ./dist

# Expose API port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["node", "dist/index.js"]
