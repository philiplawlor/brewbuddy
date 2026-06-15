# Backend - Production Dockerfile
# Optimized for production deployment

FROM node:20-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S brewbuddy && adduser -S brewbuddy -G brewbuddy

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application
COPY dist ./dist

# Change ownership to non-root user
RUN chown -R brewbuddy:brewbuddy /app

USER brewbuddy

# Expose API port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["node", "dist/index.js"]
