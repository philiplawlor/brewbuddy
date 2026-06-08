# BrewBuddy

**Version:** 0.1.0 (Pre-Release)
**License:** Private

A modern brewing assistant for homebrewers and craft brewers. Design recipes, track brew sessions, manage inventory, and optimize water chemistry — all in one place.

---

## Features

### MVP (v0.1)
- **Recipe Designer** — Create, edit, and scale recipes with real-time calculations
- **BeerXML/BeerJSON Import/Export** — Compatible with BeerSmith, Brewfather, BrewTarget
- **Brew Day Tracker** — Step-by-step guided timer with audio/push notifications
- **Fermentation Logging** — Track gravity, temperature, and pH over time
- **Water Chemistry Calculator** — Profile management with additive recommendations
- **Inventory Management** — Track grains, hops, yeast, and chemicals with cost tracking
- **Shopping Lists** — Auto-populate from recipes, track purchases
- **Device Integration** — Tilt, iSpindel, and Plaato hydrometer support
- **Brew Clubs** — Community groups with role-based permissions
- **Recipe Versioning** — Track modifications across batches

### v2 (Planned)
- AI Recipe Suggestions
- Competition Management with BJCP Scoring
- Advanced Analytics & Charts
- Yeast Propagation Tracking

### v3 (Planned)
- Professional Brewer Features
- Point of Sale Integration
- Mobile QR Codes for Batch Identification

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite + TypeScript |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | MongoDB 8.0 Community Edition |
| **Containerization** | Docker + Docker Compose |
| **Build** | Docker Buildx (linux/amd64) |

---

## Quick Start

### Prerequisites
- Docker Desktop (or Docker Engine + Compose)
- Git

### Development

```bash
# Clone the repository
git clone https://github.com/yourusername/brewbuddy.git
cd brewbuddy

# Copy environment file
cp .env.example .env

# Start development environment
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- MongoDB: localhost:27017

### Production

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with production values

# Deploy
docker compose up -d --build
```

**Access:**
- Application: http://localhost:80
- API: http://localhost:3001/api

---

## Project Structure

```
brewbuddy/
├── README.md                    # This file
├── VERSION                      # Current version
├── docker-compose.yml           # Production orchestration
├── docker-compose.dev.yml       # Development overrides
├── .env.example                 # Environment template
│
├── docs/
│   ├── PRD.md                   # Product Requirements Document
│   ├── PRD_SCHEMA.md            # MongoDB schema definitions
│   ├── PRD_UI.md                # UI/UX requirements
│   ├── DEPLOYMENT.md            # Deployment guide
│   └── CONTRIBUTING.md          # Contribution guidelines
│
├── frontend/                    # React application
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│
├── backend/                     # Express API
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│
├── scripts/
│   ├── deploy.sh                # Production deploy
│   └── deploy-dev.sh            # Development deploy
│
└── data/                        # MongoDB persistent storage
```

---

## Recipe Format Support

BrewBuddy supports the two major brewing data standards:

### BeerXML 1.0
The industry standard used by BeerSmith, Brewer's Friend, Brewfather, and Grainfather. Supports full recipe import/export with all ingredient types.

### BeerJSON 1.0
The modern successor with richer data support including unlimited fermentation steps, pH/gravity-based timing, and souring/mixed-culture processes.

See [docs/PRD.md](docs/PRD.md) for complete field mappings.

---

## API Documentation

API documentation will be available at `/api/docs` once the backend is running.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/recipes` | List all recipes |
| `POST` | `/api/recipes` | Create a recipe |
| `GET` | `/api/recipes/:id` | Get recipe details |
| `PUT` | `/api/recipes/:id` | Update a recipe |
| `DELETE` | `/api/recipes/:id` | Delete a recipe |
| `POST` | `/api/recipes/import` | Import BeerXML/BeerJSON |
| `GET` | `/api/recipes/:id/export` | Export recipe |
| `GET` | `/api/sessions` | List brew sessions |
| `POST` | `/api/sessions` | Create brew session |
| `GET` | `/api/inventory` | List inventory items |
| `GET` | `/api/water/profiles` | List water profiles |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://mongodb:27017/brewbuddy` |
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |
| `VITE_API_URL` | Frontend API URL | `http://localhost:3001/api` |

---

## Documentation

- [Product Requirements Document](docs/PRD.md)
- [Database Schema](docs/PRD_SCHEMA.md)
- [UI/UX Requirements](docs/PRD_UI.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)

---

## License

Private - All rights reserved.

---

*Built by the New England Sales Team*
