# Sprint 1: Project Foundation + Auth

**Version:** 0.1.1
**Branch:** `sprint-1`
**Units:** 5 (20 hours)
**Status:** IN PROGRESS

---

## Overview

Set up the complete project foundation with working authentication. By end of this sprint, developers can `docker compose up` and have a working full-stack app with user registration and login.

---

## Tasks

### Task 1: Backend - Express + TypeScript + MongoDB Setup (0.8 units)

**Owner:** Cody (CTO)

**Requirements:**
- Initialize `backend/` with `package.json`
- Configure TypeScript (`tsconfig.json`)
- Set up Express server with middleware (CORS, body-parser, error handling)
- Connect to MongoDB using Mongoose
- Create health check endpoint `GET /api/health`
- Create `.env.example` with required variables
- Configure `npm run dev` with ts-node-dev
- Configure `npm run build` with tsc
- Write unit tests for health endpoint

**Files to create:**
- `backend/package.json`
- `backend/tsconfig.json`
- `backend/src/index.ts`
- `backend/src/config/database.ts`
- `backend/src/routes/health.ts`
- `backend/src/middleware/errorHandler.ts`
- `backend/.env.example`
- `backend/.gitignore`
- `backend/Dockerfile` (update existing)
- `backend/Dockerfile.dev` (update existing)
- `backend/__tests__/health.test.ts`

**Acceptance Criteria:**
- [ ] `npm run dev` starts server on port 3001
- [ ] `GET /api/health` returns `{ status: "ok" }`
- [ ] MongoDB connection succeeds
- [ ] TypeScript compiles without errors
- [ ] Tests pass

---

### Task 2: Backend - User Model + Bcrypt Hashing (0.6 units)

**Owner:** Cody (CTO)

**Requirements:**
- Create User schema with Mongoose
- Fields: username, email, passwordHash, displayName, brewLevel, createdAt, updatedAt
- Implement password hashing with bcrypt (≥12 salt rounds)
- Implement password verification method
- Add unique indexes on username and email
- Write unit tests for User model

**Files to create:**
- `backend/src/models/User.ts`
- `backend/src/types/user.ts`
- `backend/__tests__/user.test.ts`

**Acceptance Criteria:**
- [ ] User can be created with hashed password
- [ ] Password verification works (correct password = true, wrong = false)
- [ ] Duplicate username/email throws error
- [ ] Indexes created correctly
- [ ] Tests pass

---

### Task 3: Backend - JWT Auth (Register/Login/Protect) (0.8 units)

**Owner:** Cody (CTO)

**Requirements:**
- Create auth routes: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
- Register: validate input, create user, return JWT
- Login: validate credentials, return JWT
- Me: protected route, return current user from token
- JWT signing with secret from env, 7-day expiration
- Create auth middleware that validates JWT
- Create validation middleware (express-validator)
- Write integration tests for auth flow

**Files to create:**
- `backend/src/routes/auth.ts`
- `backend/src/middleware/auth.ts`
- `backend/src/middleware/validate.ts`
- `backend/src/utils/generateToken.ts`
- `backend/__tests__/auth.test.ts`

**Acceptance Criteria:**
- [ ] POST /api/auth/register creates user and returns token
- [ ] POST /api/auth/login returns token for valid credentials
- [ ] GET /api/auth/me returns user data with valid token
- [ ] GET /api/auth/me returns 401 without token
- [ ] Input validation returns 400 for invalid data
- [ ] Tests pass

---

### Task 4: Frontend - React + Vite + TypeScript Scaffold (0.6 units)

**Owner:** Spark (CMO)

**Requirements:**
- Initialize `frontend/` with Vite + React + TypeScript
- Configure Tailwind CSS
- Set up project structure:
  - `src/components/` - Reusable components
  - `src/pages/` - Page components
  - `src/context/` - React context
  - `src/hooks/` - Custom hooks
  - `src/services/` - API calls
  - `src/types/` - TypeScript types
  - `src/utils/` - Utility functions
- Create basic App component with routing
- Configure API service with axios
- Set up test configuration (Vitest + React Testing Library)
- Write build test

**Files to create:**
- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/tsconfig.json`
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`
- `frontend/src/App.tsx`
- `frontend/src/main.tsx`
- `frontend/src/index.css`
- `frontend/src/services/api.ts`
- `frontend/src/types/index.ts`
- `frontend/__tests__/App.test.tsx`
- `frontend/.env.example`

**Acceptance Criteria:**
- [ ] `npm run dev` starts on port 5173
- [ ] `npm run build` succeeds
- [ ] Tailwind CSS working
- [ ] API service configured
- [ ] Tests pass

---

### Task 5: Frontend - Auth Pages (Login/Register) (0.8 units)

**Owner:** Spark (CMO)

**Requirements:**
- Create Login page with form (email, password)
- Create Register page with form (username, email, password, displayName)
- Form validation (required fields, email format, password min length)
- API integration with auth endpoints
- Error handling (display API errors)
- Responsive design with Tailwind
- Loading states during API calls
- Write component tests

**Files to create:**
- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/Register.tsx`
- `frontend/src/components/FormField.tsx`
- `frontend/src/hooks/useAuth.ts`
- `frontend/__tests__/Login.test.tsx`
- `frontend/__tests__/Register.test.tsx`

**Acceptance Criteria:**
- [ ] Login form submits to API
- [ ] Register form submits to API
- [ ] Validation errors displayed
- [ ] API errors displayed
- [ ] Loading states work
- [ ] Responsive on mobile
- [ ] Tests pass

---

### Task 6: Frontend - Auth Context + Protected Routes (0.6 units)

**Owner:** Spark (CMO)

**Requirements:**
- Create AuthContext with provider
- Store JWT in localStorage
- Auto-login on app load if token exists
- ProtectedRoute component redirects to /login if not authenticated
- Update App.tsx with routing and auth provider
- Create logout functionality
- Write context tests

**Files to create:**
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/src/pages/Dashboard.tsx` (placeholder)
- `frontend/__tests__/AuthContext.test.tsx`

**Acceptance Criteria:**
- [ ] Auth state persisted across page reloads
- [ ] Protected routes redirect to /login
- [ ] Logout clears token and redirects
- [ ] Dashboard shows user info when logged in
- [ ] Tests pass

---

### Task 7: Docker - Verify Dev Stack Runs Clean (0.4 units)

**Owner:** Grid (DevOps)

**Requirements:**
- Update `docker-compose.dev.yml` with correct service configurations
- Update `backend/Dockerfile.dev` for TypeScript development
- Update `frontend/Dockerfile.dev` for Vite development
- Verify all services start without errors
- Verify health checks pass
- Verify frontend accessible at http://localhost:5173
- Verify backend accessible at http://localhost:3001/api
- Verify MongoDB accessible at localhost:27017
- Write Docker verification script

**Files to create/update:**
- `docker-compose.dev.yml`
- `backend/Dockerfile.dev`
- `frontend/Dockerfile.dev`
- `scripts/verify-sprint.sh`

**Acceptance Criteria:**
- [ ] `docker compose -f docker-compose.dev.yml up -d --build` succeeds
- [ ] All 3 services healthy
- [ ] Frontend loads in browser
- [ ] API responds to requests
- [ ] No errors in container logs

---

## Test Strategy

### Unit Tests
- Health endpoint returns correct response
- User model hashes password correctly
- User model verifies password correctly
- JWT generation creates valid token
- Auth middleware rejects invalid tokens

### Integration Tests
- Full auth flow: register → login → access protected route
- Duplicate registration fails
- Login with wrong password fails

### Component Tests
- Login page renders correctly
- Register page renders correctly
- Form validation shows errors
- Auth context provides auth state

---

## Dependencies

- Node.js 18+
- Docker + Docker Compose
- MongoDB 8.0

---

## Success Criteria

- [ ] All tasks completed
- [ ] All tests passing
- [ ] Code coverage ≥ 80%
- [ ] Docker stack loads locally
- [ ] Frontend accessible at http://localhost:5173
- [ ] Backend API accessible at http://localhost:3001/api
- [ ] MongoDB accessible at localhost:27017
- [ ] Sprint PLAN.md committed

---

*Prepared by Sync (PM) - New England Sales Team*
