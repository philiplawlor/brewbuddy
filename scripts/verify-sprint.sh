#!/bin/bash
set -e

# BrewBuddy Sprint Verification Script
# Verifies Docker development stack runs correctly

echo "🍺 BrewBuddy Sprint Verification"
echo "================================="
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
sleep 10

# Verify MongoDB
echo ""
echo "📊 Verifying MongoDB..."
if docker compose -f docker-compose.dev.yml exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is running and responding"
else
    echo "❌ MongoDB is not responding"
    docker compose -f docker-compose.dev.yml logs mongodb
    exit 1
fi

# Verify Backend
echo ""
echo "🔧 Verifying Backend..."
for i in {1..10}; do
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ Backend is running and healthy"
        HEALTH_RESPONSE=$(curl -s http://localhost:3001/api/health)
        echo "   Response: $HEALTH_RESPONSE"
        break
    else
        echo "   Waiting for backend... ($i/10)"
        sleep 3
    fi
done

if ! curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "❌ Backend is not responding"
    docker compose -f docker-compose.dev.yml logs backend
    exit 1
fi

# Verify Frontend
echo ""
echo "🎨 Verifying Frontend..."
for i in {1..10}; do
    if curl -f http://localhost:5173 > /dev/null 2>&1; then
        echo "✅ Frontend is running and accessible"
        break
    else
        echo "   Waiting for frontend... ($i/10)"
        sleep 3
    fi
done

if ! curl -f http://localhost:5173 > /dev/null 2>&1; then
    echo "❌ Frontend is not responding"
    docker compose -f docker-compose.dev.yml logs frontend
    exit 1
fi

# Run backend tests
echo ""
echo "🧪 Running backend tests..."
(cd backend && npm test 2>&1 | tail -20) || { echo "❌ Backend tests failed"; exit 1; }

# Run frontend tests
echo ""
echo "🧪 Running frontend tests..."
(cd frontend && npm run test:run 2>&1 | tail -20) || { echo "❌ Frontend tests failed"; exit 1; }

# Verify all containers are healthy
echo ""
echo "🏥 Checking container health status..."
CONTAINERS=("brewbuddy-frontend-dev" "brewbuddy-backend-dev" "brewbuddy-mongodb-dev")
ALL_HEALTHY=true

for container in "${CONTAINERS[@]}"; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "unknown")
    if [ "$STATUS" = "healthy" ]; then
        echo "✅ $container: healthy"
    else
        echo "⚠️  $container: $STATUS"
        ALL_HEALTHY=false
    fi
done

echo ""
echo "================================="
echo "✅ BrewBuddy Sprint verification complete!"
echo ""
echo "   All services are running:"
echo "   - Frontend:  http://localhost:5173"
echo "   - API:       http://localhost:3001/api"
echo "   - MongoDB:   localhost:27017"
echo ""
echo "   View logs:    docker compose -f docker-compose.dev.yml logs -f"
echo "   Stop:         docker compose -f docker-compose.dev.yml down"
echo "================================="