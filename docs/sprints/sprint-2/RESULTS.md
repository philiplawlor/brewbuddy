# Sprint 2: Results

**Version:** 0.1.2
**Branch:** `sprint-2`
**Status:** ✅ COMPLETE
**Date:** June 9, 2026

---

## Summary

Sprint 2 delivered the core recipe management system — models, CRUD API, brewing calculation engine, search/pagination, and a full frontend with create/edit form. All 173 backend tests and 77 frontend tests pass. Docker verification is green.

---

## Deliverables

### Backend (Node.js + Express + TypeScript)

| Component | Status | Files |
|-----------|--------|-------|
| Recipe model | ✅ Complete | `src/models/Recipe.ts` |
| RecipeIngredient model | ✅ Complete | `src/models/RecipeIngredient.ts` |
| Recipe CRUD API | ✅ Complete | `src/routes/recipes.ts` |
| Brewing calculations | ✅ Complete | `src/utils/calculations.ts` |
| Recipe search + pagination | ✅ Complete | `src/routes/recipes.ts` (search routes) |

### Frontend (React + Vite + TypeScript)

| Component | Status | Files |
|-----------|--------|-------|
| Recipe list page | ✅ Complete | `src/pages/RecipeList.tsx` |
| Recipe detail page | ✅ Complete | `src/pages/RecipeDetail.tsx` |
| Recipe create/edit form | ✅ Complete | `src/pages/RecipeForm.tsx` |
| RecipeCard component | ✅ Complete | `src/components/RecipeCard.tsx` |
| RecipeStats component | ✅ Complete | `src/components/RecipeStats.tsx` |
| GrainInput component | ✅ Complete | `src/components/GrainInput.tsx` |
| HopInput component | ✅ Complete | `src/components/HopInput.tsx` |
| YeastInput component | ✅ Complete | `src/components/YeastInput.tsx` |
| IngredientList component | ✅ Complete | `src/components/IngredientList.tsx` |

### Infrastructure

| Component | Status | Files |
|-----------|--------|-------|
| Docker dev stack | ✅ Complete | `docker-compose.dev.yml` |
| Verification script | ✅ Complete | `scripts/verify-sprint.sh` |

---

## Test Results

### Backend Tests (173 passing)

| Test Suite | Tests | Status |
|------------|-------|--------|
| Health endpoint | 4 | ✅ |
| User model | 28 | ✅ |
| Auth routes | 18 | ✅ |
| Recipe CRUD | 30 | ✅ |
| Recipe search + pagination | 16 | ✅ |
| Brewing calculations | 63 | ✅ |
| Recipe model | 14 | ✅ |
| **Total** | **173** | ✅ |

### Frontend Tests (77 passing)

| Test Suite | Tests | Status |
|------------|-------|--------|
| App component | 3 | ✅ |
| Auth context | 7 | ✅ |
| Login page | 6 | ✅ |
| Register page | 6 | ✅ |
| RecipeCard | 4 | ✅ |
| RecipeStats | 5 | ✅ |
| RecipeList | 5 | ✅ |
| RecipeDetail | 5 | ✅ |
| RecipeForm | 11 | ✅ |
| GrainInput | 4 | ✅ |
| HopInput | 4 | ✅ |
| YeastInput | 4 | ✅ |
| IngredientList | 3 | ✅ |
| ProtectedRoute | 4 | ✅ |
| AuthContext | 5 | ✅ |
| **Total** | **77** | ✅ |

---

## Docker Verification

| Service | Port | Health Check | Status |
|---------|------|--------------|--------|
| Frontend | 5173 | HTTP 200 | ✅ |
| Backend | 3001 | `{"status":"ok"}` | ✅ |
| MongoDB | 27017 | ping ok | ✅ |

---

## API Endpoints (v0.1.2)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/health` | Health check | No |
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login user | No |
| `GET` | `/api/auth/me` | Get current user | Yes |
| `GET` | `/api/recipes` | List recipes (search, filter, pagination) | Yes |
| `GET` | `/api/recipes/:id` | Get recipe by ID | Yes |
| `POST` | `/api/recipes` | Create recipe | Yes |
| `PUT` | `/api/recipes/:id` | Update recipe | Yes |
| `DELETE` | `/api/recipes/:id` | Delete recipe | Yes |

---

## Brewing Calculation Engine

| Calculation | Formula | Test Coverage |
|-------------|---------|---------------|
| OG (Original Gravity) | Grain points × efficiency | ✅ 10 tests |
| FG (Final Gravity) | Attenuation × (OG - 1) | ✅ 10 tests |
| ABV | (OG - FG) × 131.25 | ✅ 10 tests |
| IBU (Tinseth) | Weight × AA% × time factor × volume | ✅ 8 tests |
| SRM (Morey) | (LME/weight) × grain Lovibond × volume | ✅ 8 tests |
| Calories | (OG - FG) × 131.25 × 7.7 | ✅ 8 tests |

---

## Git History

| Commit | Description |
|--------|-------------|
| `8dd789a` | feat(backend): Add Recipe and RecipeIngredient Mongoose models with tests |
| `1d53189` | feat(backend): Recipe CRUD API with JWT authentication |
| `52356f9` | feat(backend): Brewing calculation engine with 63 unit tests |
| `751447f` | feat(frontend): Recipe list and detail views with components |
| `a69fb74` | feat(frontend): Recipe create/edit form with dynamic ingredients |
| `95be6f7` | feat(backend): Recipe search, filter, and pagination |
| `3a3b7cb` | fix(frontend): Fix test failures and update verification script |

---

## Code Quality Notes (for v2 backlog)

| Issue | Severity | Task |
|-------|----------|------|
| MongoDB reconnection logic needed | Important | 1 |
| CORS origin restriction needed | Important | 1, 3 |
| Rate limiting on auth endpoints | Important | 3 |
| `select: false` on passwordHash field | Minor | 2 |
| JWT fallback secret in dev only | Important | 3 |
| Mongoose `pre('save')` async hook uses deprecated `next` callback | Minor | 1 |
| `.env.example` says JWT config "for future use" — inaccurate | Minor | 3 |

---

## Lessons Learned

1. **Form validation without noValidate** — React forms with custom validation need `noValidate` on `<form>` elements or browser-native validation can block submission before custom logic runs.
2. **Dynamic form fields** — Grain/Hop/Yeast inputs need carefully controlled key patterns for React to properly unmount/remount when removing items.
3. **Text search indexes** — Adding a Mongoose text index on `recipeName` was essential for efficient search; basic regex was too slow at scale.
4. **`tsx` over `ts-node-dev`** — tsx handles TypeScript 5.9+ better than ts-node-dev; confirmed in Sprint 1 and validated again here.

---

## Next Sprint Preview

**Sprint 3: Brew Day Timer** (v0.1.3)
- Brew session tracking with timer
- Step-by-step brew guide with countdown
- Session log for notes, gravity readings, temperature
- Brew history dashboard

---

*Prepared by Sync (PM) - New England Sales Team*
