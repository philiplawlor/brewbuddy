# Sprint 7 Results: Community Ratings, Comments & Sharing

**Version:** v0.4.0
**Tag:** `sprint-7`
**Date:** June 13, 2026

## Summary

Sprint 7 adds community features to BrewBuddy: recipe sharing, star ratings, comments, and a dedicated Community page. Recipes can be made public via an `isPublic` toggle, and users can rate and comment on shared recipes.

## Completed Tasks

### Task 1: Rating Model + API ✅
- `Rating.ts` model with compound unique index (recipeId+userId)
- POST `/:id/rate` — upsert rating per user per recipe
- GET `/:id/ratings` — returns averageRating, ratingCount, userRating
- Recipe model updated with `averageRating` and `ratingCount` fields

### Task 2: Comment Model + API ✅
- `Comment.ts` model (text max 1000 chars, timestamps)
- POST `/:id/comments` — auth required, creates comment
- GET `/:id/comments` — public, returns comments with usernames
- DELETE `/:id/comments/:commentId` — owner only

### Task 3: Community API ✅
- GET `/community` — public, search/style/sort/pagination
- GET `/community/:id` — public recipe detail with comments

### Task 4: StarRating Component ✅
- Interactive + display modes
- 1-5 stars with hover effect
- Theme-aware colors

### Task 5: CommentSection Component ✅
- Post form (auth required)
- Comment list (newest first)
- Delete own comments with confirmation
- Auth prompt for logged-out users

### Task 6: Community Page + RecipeCard ✅
- `/community` page with search, style filter, sort, pagination
- CommunityRecipeCard with ratings display

### Task 7: Share Flow ✅
- isPublic toggle in RecipeForm (instructions step)
- Share/Unshare button on RecipeDetail with confirmation

### Task 8: CommunityRecipeDetail Page ✅
- `/community/recipe/:id` — public view with StarRating + CommentSection

### Task 9: Integration Tests ✅
- StarRating: 9 tests
- CommentSection: 10 tests
- CommunityPage: 10 tests
- CommunityRecipeDetail: 10 tests
- CommunityRecipeCard: 10 tests
- Total new: 49 tests

### Task 10: Docker Verification ✅
- All containers healthy (frontend:5173, backend:3001, mongodb:27017)
- 177 frontend tests passing (23 test files)
- VERSION bumped to 0.4.0
- Tagged `sprint-7`

## Test Results

| Category | Files | Tests | Status |
|----------|-------|-------|--------|
| Frontend | 23 | 177 | ✅ All passing |
| Backend | — | ~277 | ✅ Existing tests unchanged |

## Breaking Changes

None.

## New Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/recipes/community` | No | List shared recipes |
| GET | `/api/recipes/community/:id` | No | View shared recipe |
| POST | `/api/recipes/:id/rate` | Yes | Rate a recipe |
| GET | `/api/recipes/:id/ratings` | No | Get recipe ratings |
| POST | `/api/recipes/:id/comments` | Yes | Add comment |
| GET | `/api/recipes/:id/comments` | No | Get comments |
| DELETE | `/api/recipes/:id/comments/:commentId` | Yes | Delete own comment |

## New Frontend Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/community` | Community.tsx | Browse shared recipes |
| `/community/recipe/:id` | CommunityRecipeDetail.tsx | View shared recipe |
