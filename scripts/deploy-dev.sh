#!/bin/bash
set -e

# BrewBuddy Development Deploy Script
# Usage: ./scripts/deploy-dev.sh

echo "🍺 BrewBuddy Development Environment"
echo "====================================="
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

# Check for port conflicts
PORTS_IN_USE=0
for port in 5173 3001 27017; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use."
        PORTS_IN_USE=1
    fi
done

if [ $PORTS_IN_USE -eq 1 ]; then
    echo ""
    echo "   Stop conflicting services or change ports in docker-compose.dev.yml"
    exit 1
fi

# Create .env if missing
if [ ! -f .env ]; then
    echo "⚠️  .env not found, copying from .env.example..."
    cp .env.example .env
    echo "✅ Created .env from .env.example"
fi

echo "🔨 Building and starting services..."
docker compose -f docker-compose.dev.yml up -d --build

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

echo ""
echo "====================================="
echo "✅ BrewBuddy development environment started!"
echo ""
echo "   Frontend:  http://localhost:5173"
echo "   API:       http://localhost:3001/api"
echo "   MongoDB:   localhost:27017"
echo ""
echo "   View logs:    docker compose -f docker-compose.dev.yml logs -f"
echo "   Stop:         docker compose -f docker-compose.dev.yml down"
echo "   Rebuild:      docker compose -f docker-compose.dev.yml up -d --build"
echo "====================================="
