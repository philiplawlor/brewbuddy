# BrewBuddy - Deployment Guide

**Version:** 0.1.0

---

## Overview

BrewBuddy uses Docker Compose for both development and production deployments. This guide covers setup, configuration, and deployment procedures.

---

## Prerequisites

### Development
- Docker Desktop (or Docker Engine + Compose v2)
- Git
- 4GB RAM minimum

### Production
- Docker Engine + Compose v2
- 8GB RAM minimum
- 20GB disk space
- Ports 80, 3001, 27017 available

---

## Quick Start

### Development

```bash
# 1. Clone repository
git clone https://github.com/yourusername/brewbuddy.git
cd brewbuddy

# 2. Copy environment file
cp .env.example .env

# 3. Start development environment
docker compose -f docker-compose.dev.yml up -d

# 4. View logs
docker compose -f docker-compose.dev.yml logs -f
```

**Access Points:**
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001/api |
| MongoDB | localhost:27017 |

### Production

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with production values

# 2. Build and start
docker compose up -d --build

# 3. Verify
docker compose ps
docker compose logs
```

**Access Points:**
| Service | URL |
|---------|-----|
| Application | http://localhost |
| API | http://localhost/api |
| MongoDB | localhost:27017 (internal only) |

---

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://mongodb:27017/brewbuddy` |
| `MONGODB_INITDB_ROOT_USERNAME` | MongoDB admin username | `admin` |
| `MONGODB_INITDB_ROOT_PASSWORD` | MongoDB admin password | `secure_password_here` |
| `JWT_SECRET` | JWT signing secret | `your_256bit_secret_here` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` |
| `VITE_API_URL` | Frontend API URL | `http://localhost:3001/api` |

### Production Security

**Change these before deploying:**
1. `MONGODB_INITDB_ROOT_PASSWORD` — Use a strong, unique password
2. `JWT_SECRET` — Generate with `openssl rand -base64 64`
3. Remove `.env.example` from production
4. Never commit `.env` to version control

---

## Docker Compose Files

### docker-compose.yml (Production)

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - brewbuddy-network

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/brewbuddy
    depends_on:
      - mongodb
    networks:
      - brewbuddy-network

  mongodb:
    image: mongo:8.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGODB_INITDB_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGODB_INITDB_ROOT_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    networks:
      - brewbuddy-network

volumes:
  mongodb_data:

networks:
  brewbuddy-network:
    driver: bridge
```

### docker-compose.dev.yml (Development)

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend/src:/app/src
    environment:
      - VITE_API_URL=http://localhost:3001/api
    depends_on:
      - backend
    networks:
      - brewbuddy-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    volumes:
      - ./backend/src:/app/src
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/brewbuddy
      - NODE_ENV=development
    depends_on:
      - mongodb
    networks:
      - brewbuddy-network

  mongodb:
    image: mongo:8.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - brewbuddy-network

volumes:
  mongodb_data:

networks:
  brewbuddy-network:
    driver: bridge
```

---

## Dockerfiles

### Frontend (Production)

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Frontend (Development)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

### Backend (Production)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### Backend (Development)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]
```

---

## Deployment Scripts

### Production Deploy (deploy.sh)

```bash
#!/bin/bash
set -e

echo "🍺 Deploying BrewBuddy..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker."
    exit 1
fi

# Check .env
if [ ! -f .env ]; then
    echo "❌ .env file not found. Copy .env.example to .env and configure."
    exit 1
fi

# Build and start
echo "🔨 Building images..."
docker compose build

echo "🚀 Starting services..."
docker compose up -d

# Wait for MongoDB
echo "⏳ Waiting for MongoDB..."
sleep 5

# Health check
echo "🔍 Checking health..."
curl -f http://localhost/api/health || exit 1

echo "✅ BrewBuddy deployed successfully!"
echo "   Frontend: http://localhost"
echo "   API: http://localhost/api"
```

### Development Deploy (deploy-dev.sh)

```bash
#!/bin/bash
set -e

echo "🍺 Starting BrewBuddy development environment..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker."
    exit 1
fi

# Check .env
if [ ! -f .env ]; then
    echo "⚠️  .env not found, copying from .env.example..."
    cp .env.example .env
fi

# Check for port conflicts
for port in 5173 3001 27017; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use. Stop the conflicting service or change ports."
        exit 1
    fi
done

# Start development environment
echo "🚀 Starting services..."
docker compose -f docker-compose.dev.yml up -d --build

# Wait for MongoDB
echo "⏳ Waiting for MongoDB..."
sleep 3

echo "✅ BrewBuddy development environment started!"
echo "   Frontend: http://localhost:5173"
echo "   API: http://localhost:3001/api"
echo "   MongoDB: localhost:27017"
echo ""
echo "   View logs: docker compose -f docker-compose.dev.yml logs -f"
echo "   Stop: docker compose -f docker-compose.dev.yml down"
```

---

## Data Persistence

### MongoDB Data

MongoDB data is stored in a Docker volume named `mongodb_data`.

**Commands:**
```bash
# List volumes
docker volume ls

# Inspect MongoDB volume
docker volume inspect brewbuddy_mongodb_data

# Backup
docker exec mongodb mongodump --archive --gzip > backup.gz

# Restore
docker exec -i mongodb mongorestore --archive --gzip < backup.gz
```

### Backup Script

```bash
#!/bin/bash
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/brewbuddy_$TIMESTAMP.gz"

mkdir -p $BACKUP_DIR

echo "📦 Creating backup..."
docker exec mongodb mongodump --archive --gzip > $BACKUP_FILE

echo "✅ Backup created: $BACKUP_FILE"

# Keep only last 7 backups
ls -t $BACKUP_DIR/brewbuddy_*.gz | tail -n +8 | xargs rm -f 2>/dev/null
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Stop conflicting service or change ports in compose files |
| MongoDB connection refused | Wait for MongoDB to initialize (check logs) |
| Permission denied on scripts | Run `chmod +x scripts/*.sh` |
| Out of memory | Increase Docker memory limit to 4GB+ |
| Frontend can't reach API | Check `VITE_API_URL` in `.env` |

### Useful Commands

```bash
# View logs
docker compose logs -f [service]

# Rebuild a single service
docker compose build [service]
docker compose up -d [service]

# Enter a container
docker compose exec [service] sh

# Check MongoDB
docker compose exec mongodb mongosh -u admin -p

# Reset everything (⚠️ destroys data)
docker compose down -v
docker compose up -d --build
```

---

## Production Checklist

- [ ] Strong MongoDB password configured
- [ ] JWT secret generated and set
- [ ] HTTPS configured (reverse proxy recommended)
- [ ] Backup schedule configured
- [ ] Monitoring set up
- [ ] Logs centralized
- [ ] Firewall rules configured
- [ ] Domain DNS configured (if applicable)

---

*Prepared by Grid (DevOps) - New England Sales Team*
