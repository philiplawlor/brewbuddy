# Frontend - Production Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set API URL to relative path (nginx proxies /api/ to backend)
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Build application (sourcemaps disabled by default in vite.config.ts)
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Create non-root user for nginx
RUN addgroup -S brewbuddy && adduser -S brewbuddy -G brewbuddy

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Fix permissions for nginx
RUN chown -R brewbuddy:brewbuddy /usr/share/nginx/html && \
    chown -R brewbuddy:brewbuddy /var/cache/nginx && \
    chown -R brewbuddy:brewbuddy /var/log/nginx && \
    chown -R brewbuddy:brewbuddy /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown brewbuddy:brewbuddy /var/run/nginx.pid

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
