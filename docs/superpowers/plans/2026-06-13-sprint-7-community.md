# Sprint 7 PLAN — Shared Library + Ratings/Comments

**Date:** 2026-06-13
**Version:** v0.4.0
**Branch:** `sprint-7`
**Spec:** `docs/superpowers/specs/2026-06-13-theme-switching-shared-library-ratings.md`

## Objective

Build the community recipe sharing system with ratings and comments. This sprint transforms BrewBuddy from a personal brewing tool into a social platform where brewers can share recipes, rate them, and discuss brewing techniques.

## Acceptance Criteria

- [ ] Community page (`/community`) browses public recipes without auth
- [ ] Share flow: RecipeForm has `isPublic` toggle, RecipeDetail has Share button
- [ ] Rating model: 1-5 stars, one per user per recipe, upsert on update
- [ ] Comment model: Flat text comments, auth required to post, owner can delete
- [ ] Community API: GET `/api/recipes/community` with search, filter, sort, pagination
- [ ] StarRating component: Interactive input + display mode
- [ ] CommentSection component: Post, list, delete comments
- [ ] CommunityRecipeDetail page: Public recipe view with ratings + comments
- [ ] All 128+ frontend tests pass
- [ ] Docker verification passes

## Task Breakdown

### Task 1: Rating Model + API (backend)
**Files:** `backend/src/models/Rating.ts`, `backend/src/routes/recipes.ts`
**Tests:** `backend/__tests__/rating.test.ts`

- Create Rating model with recipeId, userId, rating (1-5), createdAt
- Compound unique index on recipeId + userId
- POST `/api/recipes/:id/rate` — rate or update rating (upsert)
- GET `/api/recipes/:id/ratings` — get summary (averageRating, ratingCount, userRating)
- Update Recipe document with computed averageRating and ratingCount
- TDD: Write tests first, then implement

### Task 2: Comment Model + API (backend)
**Files:** `backend/src/models/Comment.ts`, `backend/src/routes/recipes.ts`
**Tests:** `backend/__tests__/comment.test.ts`

- Create Comment model with recipeId, userId, text (max 1000), createdAt, updatedAt
- POST `/api/recipes/:id/comments` — add comment (auth required)
- GET `/api/recipes/:id/comments` — list comments (newest first, no auth)
- DELETE `/api/recipes/:id/comments/:commentId` — delete own comment only
- TDD: Write tests first, then implement

### Task 3: Community API endpoint (backend)
**Files:** `backend/src/routes/recipes.ts`
**Tests:** `backend/__tests__/community.test.ts`

- GET `/api/recipes/community` — browse public recipes
  - Query params: search, style, sort (rating/newest/popular), page, limit
  - Returns recipes with isPublic=true, includes averageRating, ratingCount
  - Pagination support
- GET `/api/recipes/community/:id` — view shared recipe detail
  - Returns recipe with ratings, comments, brewer info
  - No auth required
- TDD: Write tests first, then implement

### Task 4: StarRating component (frontend)
**Files:** `frontend/src/components/StarRating.tsx`, `frontend/__tests__/StarRating.test.tsx`

- Interactive mode: Click to rate (1-5 stars)
- Display mode: Show average rating (read-only)
- Props: `rating`, `onRate?`, `interactive?`, `size?`
- Theme-aware styling
- TDD: Write tests first, then implement

### Task 5: CommentSection component (frontend)
**Files:** `frontend/src/components/CommentSection.tsx`, `frontend/__tests__/CommentSection.test.tsx`

- Comment list (newest first)
- Comment input form (auth required)
- Delete button for own comments
- Props: `recipeId`, `comments`, `onAdd`, `onDelete`
- Theme-aware styling
- TDD: Write tests first, then implement

### Task 6: Community page + RecipeCard (frontend)
**Files:** `frontend/src/pages/Community.tsx`, `frontend/src/components/CommunityRecipeCard.tsx`, `frontend/__tests__/Community.test.tsx`

- Community page with hero, search, filters, sort, pagination
- CommunityRecipeCard: name, style, brewer, method, rating badge
- Responsive grid layout
- Theme-aware styling
- TDD: Write tests first, then implement

### Task 7: Share flow (frontend)
**Files:** `frontend/src/pages/RecipeForm.tsx`, `frontend/src/pages/RecipeDetail.tsx`, `frontend/__tests__/ShareFlow.test.tsx`

- RecipeForm: Add `isPublic` toggle checkbox
- RecipeDetail: Add Share/Unshare button with confirmation
- Toast notifications for share actions
- TDD: Write tests first, then implement

### Task 8: CommunityRecipeDetail page (frontend)
**Files:** `frontend/src/pages/CommunityRecipeDetail.tsx`, `frontend/__tests__/CommunityRecipeDetail.test.tsx`

- Public recipe detail view
- StarRating display
- CommentSection integration
- No auth required to view
- Theme-aware styling
- TDD: Write tests first, then implement

### Task 9: Integration tests
**Files:** `frontend/__tests__/integration/CommunityFlow.test.tsx`

- End-to-end flow: Share recipe → Browse community → Rate → Comment
- Verify all components work together
- TDD: Write tests first, then implement

### Task 10: Docker verification + VERSION bump + tag
**Files:** `VERSION`, `docs/superpowers/results/2026-06-13-sprint-7-community.md`

- Docker build and verify all services healthy
- Run full test suite
- Bump VERSION to 0.4.0
- Write RESULTS.md
- Tag `sprint-7`
- Merge to main

## Dependencies

- Sprint 6 (Theme Switching) — completed
- Recipe model already has `isPublic` field (default: false)
- Recipe API already filters by userId in GET endpoint

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Subagent tool failure | High | Medium | Execute inline as workaround |
| Rating aggregation performance | Low | Low | Use MongoDB aggregation pipeline |
| Comment spam | Low | Medium | Text maxlength 1000, auth required |
| Private recipe leaks | Low | High | Community endpoint only returns isPublic=true |

## NES Team Approval

| Role | Name | Status | Notes |
|------|------|--------|-------|
| CEO | Apex | ⏳ | Pending |
| CFO | Ledger | ⏳ | Pending |
| COO | Forge | ⏳ | Pending |
| CTO | Cody | ⏳ | Pending |
| PM | Sync | ⏳ | Pending |
