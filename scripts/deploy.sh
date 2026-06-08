#!/bin/bash
set -e

# BrewBuddy Production Deploy Script
# Usage: ./scripts/deploy.sh

echo "🍺 BrewBuddy Production Deployment"
echo "===================================="
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker."
    exit 1
fi

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose v2."
    exit 1
fi

# Check .env
if [ ! -f .env ]; then
    echo "❌ .env file not found."
    echo "   Copy .env.example to .env and configure for production."
    exit 1
fi

# Check for required variables
source .env
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your_jwt_secret_here" ]; then
    echo "❌ JWT_SECRET not configured in .env"
    echo "   Generate with: openssl rand -base64 64"
    exit 1
fi

if [ -z "$MONGODB_INITDB_ROOT_PASSWORD" ] || [ "$MONGODB_INITDB_ROOT_PASSWORD" = "changeme_in_production" ]; then
    echo "❌ MONGODB_INITDB_ROOT_PASSWORD not configured in .env"
    echo "   Set a strong, unique password."
    exit 1
fi

echo "📦 Building images..."
docker compose build

echo ""
echo "🚀 Starting services..."
docker compose up -d

echo ""
echo "⏳ Waiting for MongoDB to initialize..."
sleep 10

echo ""
echo "🔍 Checking service health..."
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend health check failed (may still be starting)"
fi

echo ""
echo "===================================="
echo "✅ BrewBuddy deployed successfully!"
echo ""
echo "   Application: http://localhost"
echo "   API:         http://localhost/api"
echo "   MongoDB:     localhost:27017"
echo ""
echo "   Logs:        docker compose logs -f"
echo "   Stop:        docker compose down"
echo "===================================="
