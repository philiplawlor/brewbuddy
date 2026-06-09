# Sprint 2: Recipe CRUD API

**Version:** 0.1.2
**Branch:** `sprint-2`
**Units:** 5 (20 hours)
**Status:** IN PROGRESS

---

## Overview

Build the complete Recipe CRUD system with real-time brewing calculations. By end of this sprint, users can create, read, update, and delete recipes with automatic OG, FG, IBU, SRM, and ABV calculations.

---

## Tasks

### Task 1: Backend - Recipe Model + Schema (0.8 units)

**Owner:** Cody (CTO)

**Requirements:**
- Create Recipe schema with Mongoose
- Fields from PRD_SCHEMA.md: recipeName, style, styleCode, method, batchSize, boilTimeMinutes, efficiency, estimated stats, mashProfile, fermentationProfile
- Create RecipeIngredient schema for grains, hops, yeast, adjuncts
- Add indexes for userId, style, isPublic, createdAt
- Write unit tests for Recipe model

**Files to create:**
- `backend/src/models/Recipe.ts`
- `backend/src/models/RecipeIngredient.ts`
- `backend/src/types/recipe.ts`
- `backend/__tests__/recipe.test.ts`

**Acceptance Criteria:**
- [ ] Recipe can be created with all fields
- [ ] RecipeIngredient links to Recipe correctly
- [ ] Indexes created for efficient queries
- [ ] Tests pass

---

### Task 2: Backend - Recipe CRUD API (1.0 units)

**Owner:** Cody (CTO)

**Requirements:**
- Create CRUD routes: GET /api/recipes, POST /api/recipes, GET /api/recipes/:id, PUT /api/recipes/:id, DELETE /api/recipes/:id
- GET /api/recipes - list user's recipes with pagination
- POST /api/recipes - create new recipe
- GET /api/recipes/:id - get recipe by ID (owner or public)
- PUT /api/recipes/:id - update recipe (owner only)
- DELETE /api/recipes/:id - soft delete recipe (owner only)
- Add authentication middleware to protected routes
- Write integration tests for CRUD operations

**Files to create:**
- `backend/src/routes/recipes.ts`
- `backend/__tests__/recipes-crud.test.ts`

**Acceptance Criteria:**
- [ ] GET /api/recipes returns user's recipes
- [ ] POST /api/recipes creates recipe
- [ ] GET /api/recipes/:id returns recipe
- [ ] PUT /api/recipes/:id updates recipe
- [ ] DELETE /api/recipes/:id soft deletes recipe
- [ ] Unauthenticated requests rejected
- [ ] Tests pass

---

### Task 3: Backend - Brewing Calculations (1.0 units)

**Owner:** Cody (CTO)

**Requirements:**
- Implement brewing calculation engine
- Calculate OG (Original Gravity) from fermentables + efficiency
- Calculate FG (Final Gravity) from OG + yeast attenuation
- Calculate IBU (Bitterness) using Tinseth formula
- Calculate SRM (Color) using Morey equation
- Calculate ABV from OG and FG
- Auto-update estimated stats when recipe changes
- Write unit tests for all calculations

**Files to create:**
- `backend/src/utils/calculations.ts`
- `backend/__tests__/calculations.test.ts`

**Acceptance Criteria:**
- [ ] OG calculated correctly from grain bill
- [ ] FG calculated from OG and attenuation
- [ ] IBU calculated using Tinseth
- [ ] SRM calculated using Morey
- [ ] ABV calculated from OG/FG
- [ ] All calculation tests pass

---

### Task 4: Frontend - Recipe List + Detail Views (1.0 units)

**Owner:** Spark (CMO)

**Requirements:**
- Create RecipeList page with search/filter
- Create RecipeDetail page showing full recipe
- Display calculated stats (OG, FG, IBU, SRM, ABV)
- Show ingredient list (grains, hops, yeast)
- Responsive design with Tailwind
- Write component tests

**Files to create:**
- `frontend/src/pages/RecipeList.tsx`
- `frontend/src/pages/RecipeDetail.tsx`
- `frontend/src/components/RecipeCard.tsx`
- `frontend/src/components/IngredientList.tsx`
- `frontend/__tests__/RecipeList.test.tsx`
- `frontend/__tests__/RecipeDetail.test.tsx`

**Acceptance Criteria:**
- [ ] Recipe list shows user's recipes
- [ ] Recipe detail shows full recipe info
- [ ] Calculated stats displayed
- [ ] Ingredients listed correctly
- [ ] Responsive on mobile
- [ ] Tests pass

---

### Task 5: Frontend - Recipe Create/Edit Form (1.0 units)

**Owner:** Spark (CMO)

**Requirements:**
- Create RecipeForm component for create/edit
- Form fields: name, style, method, batch size, boil time, efficiency
- Dynamic ingredient sections (add/remove grains, hops, yeast)
- Real-time calculation preview as user types
- Form validation
- API integration for create/update
- Write component tests

**Files to create:**
- `frontend/src/pages/RecipeForm.tsx`
- `frontend/src/components/RecipeStats.tsx`
- `frontend/src/components/GrainInput.tsx`
- `frontend/src/components/HopInput.tsx`
- `frontend/src/components/YeastInput.tsx`
- `frontend/__tests__/RecipeForm.test.tsx`

**Acceptance Criteria:**
- [ ] Form creates new recipe
- [ ] Form edits existing recipe
- [ ] Ingredients can be added/removed
- [ ] Stats update in real-time
- [ ] Validation works
- [ ] Tests pass

---

### Task 6: Backend - Recipe Search + Pagination (0.2 units)

**Owner:** Cody (CTO)

**Requirements:**
- Add search by recipe name (text index)
- Add filter by style
- Add pagination (skip/limit)
- Add sort options (createdAt, recipeName)
- Write integration tests

**Files to create:**
- `backend/__tests__/recipes-search.test.ts`

**Acceptance Criteria:**
- [ ] Search by name works
- [ ] Filter by style works
- [ ] Pagination works
- [ ] Sort options work
- [ ] Tests pass

---

### Task 7: Docker + Integration Test (0.0 units)

**Owner:** Grid (DevOps)

**Requirements:**
- Verify Docker stack still works
- Run all tests
- Verify API endpoints accessible
- Update verification script

**Acceptance Criteria:**
- [ ] Docker stack loads
- [ ] All backend tests pass
- [ ] All frontend tests pass
- [ ] API endpoints accessible

---

## Test Strategy

### Unit Tests
- Recipe model creation and validation
- RecipeIngredient schema validation
- Brewing calculation accuracy (OG, FG, IBU, SRM, ABV)
- Search and pagination logic

### Integration Tests
- Full CRUD flow: create → read → update → delete
- Authentication on recipe endpoints
- Pagination and search

### Component Tests
- Recipe list renders correctly
- Recipe detail displays all info
- Recipe form submits correctly
- Real-time stats update

---

## Dependencies

- Sprint 1 (Auth system)
- Node.js 18+
- Docker + Docker Compose
- MongoDB 8.0

---

## Success Criteria

- [ ] All tasks completed
- [ ] All tests passing
- [ ] Docker stack loads locally
- [ ] Recipe CRUD fully functional
- [ ] Brewing calculations accurate
- [ ] Frontend responsive
- [ ] Sprint PLAN.md committed

---

*Prepared by Sync (PM) - New England Sales Team*
