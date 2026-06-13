# Design Spec: Theme Switching, Shared Library, Ratings & Comments

**Date:** 2026-06-13
**Status:** Approved
**Sprint 6:** Theme Switching + Hero Fix (v0.3.0)
**Sprint 7:** Shared Library + Ratings/Comments (v0.4.0)

---

## Sprint 6 — Theme Switching + Hero Fix

### 6.1 Hero Fix

**Problem:** Landing hero section appears all black after page load.

**Root cause:** The hero `<div>` starts with `opacity-0` class and relies on `useEffect` + `animate-fade-in` to become visible. If the animation fails to apply or is delayed, the hero stays invisible on the near-black `#0a0a0a` background.

**Fix:**
- Remove `opacity-0` from the hero div
- Use Tailwind's `animate-fade-in` class directly in JSX (no JS dependency)
- Ensure background gradient orbs have sufficient opacity (bump from 5-10% to 10-15%)
- Add `will-change: opacity` for GPU-accelerated rendering

**Acceptance criteria:**
- Hero section is visible immediately on page load
- Gradient orbs are visible against dark background
- Animation is smooth (no flash of invisible content)

---

### 6.2 Theme System Architecture

**Approach:** CSS custom properties (variables) for all theme-sensitive colors, with Tailwind utility classes mapped to those variables.

**Existing state:**
- `global.css` defines 6 CSS variables in `:root` (hardcoded to dark theme)
- `tailwind.config.js` has `darkMode: 'class'` configured
- Components use hardcoded Tailwind color classes (`text-white`, `bg-brewery-black`, etc.)

**New architecture:**
- Define complete color token sets for each theme in `global.css`
- Map Tailwind colors to CSS variables via `tailwind.config.js`
- Theme context manages active theme, persists to `localStorage`
- `<html>` element receives theme class on mount (prevents FOUC)

---

### 6.3 Four Theme Modes

| Mode | HTML Class | Background | Text Primary | Text Secondary | Accent | Card BG | Border |
|------|-----------|------------|-------------|---------------|--------|---------|--------|
| **Light** | `theme-light` | `#faf7f2` (warm cream) | `#1a1612` (dark brown) | `#6b5e52` (warm gray) | `#d97706` (amber) | `#ffffff` | `#e8e0d8` |
| **Dark** (default) | `theme-dark` | `#0a0a0a` (near-black) | `#fafafa` (cream white) | `#a3a3a3` (gray) | `#d97706` (amber) | `#1a1a1a` | `#2a2a2a` |
| **High Contrast** | `theme-high-contrast` | `#000000` (pure black) | `#ffffff` (pure white) | `#e0e0e0` (light gray) | `#f59e0b` (bright amber) | `#1a1a1a` | `#ffffff` |
| **System** | (none — reads OS) | Follows `prefers-color-scheme` | — | — | — | — | — |

**CSS variable tokens per theme:**
```
--bg-primary, --bg-secondary, --bg-card, --bg-input
--text-primary, --text-secondary, --text-muted
--accent-primary, --accent-secondary, --accent-hover
--border-default, --border-hover
--shadow-card, --shadow-hover
--scrollbar-track, --scrollbar-thumb
```

---

### 6.4 Navbar Theme Toggle

**Location:** Top-right of `Navbar.tsx`, left of the user menu/logout.

**Behavior:**
- Single icon button that cycles through modes: Light → Dark → High Contrast → System
- Icons: ☀️ (Light), 🌙 (Dark), ◐ (High Contrast), 💻 (System)
- Tooltip shows current mode name
- Click cycles to next mode
- Persisted in `localStorage` key `brewbuddy-theme`
- On app load: read `localStorage`, apply class to `<html>`

**System mode behavior:**
- No class added to `<html>` — relies on CSS `@media (prefers-color-scheme: dark/light)`
- Media query in `global.css` provides default color tokens
- If user switches TO System, remove any existing theme class

---

### 6.5 Scope of Changes

**New files:**
- `frontend/src/context/ThemeContext.tsx` — Theme provider + `useTheme` hook
- `frontend/src/components/Navbar/ThemeToggle.tsx` — Toggle button component

**Modified files:**
- `frontend/src/styles/global.css` — Full CSS variable sets for all themes + media queries
- `frontend/src/tailwind.config.js` — Map theme colors to CSS variables
- `frontend/src/components/Layout/Navbar.tsx` — Add ThemeToggle
- `frontend/src/App.tsx` — Wrap with ThemeProvider
- `frontend/src/pages/Landing.tsx` — Fix hero visibility
- All page/component files — Replace hardcoded colors with theme-aware classes

**Testing:**
- Theme persists across page reloads
- System mode respects OS preference
- High contrast mode has sufficient contrast ratio (WCAG AAA)
- All 4 modes render correctly on key pages (Landing, Dashboard, RecipeDetail, BrewTimer)
- Existing 114 frontend tests continue passing

---

## Sprint 7 — Shared Library + Ratings/Comments

### 7.1 Community Page (`/community`)

**Route:** `/community` (public — no auth required to browse)

**Layout:**
- Hero section: "Community Recipes" title + description
- Search bar (by recipe name)
- Style filter dropdown (populated from existing styles)
- Sort dropdown: Highest Rated (by averageRating), Most Rated (by ratingCount), Newest, Oldest
- Recipe card grid (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
- Pagination

**Community Recipe Card:**
- Recipe name (Oswald display font)
- Style badge
- Brewer name (username)
- Brew method badge
- Average rating (1-5 stars display)
- Rating count
- Click navigates to `/community/recipe/:id`

---

### 7.2 Share Flow

**Two mechanisms:**

1. **RecipeForm (new/edit):** `isPublic` toggle checkbox in the form. Already exists in the model and validation — needs UI toggle.

2. **RecipeDetail (owner view):** "Share Recipe" button. When clicked:
   - If currently private → confirmation toast "Share this recipe with the community?" → sets `isPublic: true`
   - If currently shared → "Unshare" option → sets `isPublic: false`
   - Toast confirms action

**Shareable URL:** `/community/recipe/:id` — public route, no auth needed.

---

### 7.3 Rating Model

```typescript
// backend/src/models/Rating.ts
{
  recipeId: ObjectId (ref 'Recipe', required, indexed),
  userId: ObjectId (ref 'User', required, indexed),
  rating: Number (1-5, required, min: 1, max: 5),
  createdAt: Date
}
```

**Constraints:**
- One rating per user per recipe (compound unique index on `recipeId + userId`)
- Upsert on update (if user rates again, replace previous rating)

**Recipe document updates:**
- `averageRating`: Number (computed, stored on Recipe)
- `ratingCount`: Number (computed, stored on Recipe)
- Updated via aggregation pipeline on rating create/update/delete

---

### 7.4 Comment Model

```typescript
// backend/src/models/Comment.ts
{
  recipeId: ObjectId (ref 'Recipe', required, indexed),
  userId: ObjectId (ref 'User', required, indexed),
  text: String (required, trim, maxlength: 1000),
  createdAt: Date,
  updatedAt: Date
}
```

**Behavior:**
- Flat list (no threading), sorted by `createdAt: -1` (newest first)
- Owner can delete their own comments
- Auth required to post
- No auth required to read

---

### 7.5 API Endpoints

| Method | Endpoint | Auth | Request Body | Response | Description |
|--------|----------|------|-------------|----------|-------------|
| GET | `/api/recipes/community` | No | — | `{ recipes, pagination }` | Browse public recipes. Query params: `search`, `style`, `sort` (rating/newest/popular), `page`, `limit` |
| GET | `/api/recipes/community/:id` | No | — | `{ recipe }` | View shared recipe detail with ratings |
| POST | `/api/recipes/:id/rate` | Yes | `{ rating: 1-5 }` | `{ rating, averageRating, ratingCount }` | Rate or update rating for a recipe |
| GET | `/api/recipes/:id/ratings` | No | — | `{ averageRating, ratingCount, userRating? }` | Get ratings summary (userRating if authenticated) |
| POST | `/api/recipes/:id/comments` | Yes | `{ text }` | `{ comment }` | Add comment to recipe |
| GET | `/api/recipes/:id/comments` | No | — | `{ comments }` | Get comments for recipe (newest first) |
| DELETE | `/api/recipes/:id/comments/:commentId` | Yes | — | `{ message }` | Delete own comment |

---

### 7.6 Frontend Components

**New components:**
- `StarRating.tsx` — Interactive 1-5 star input + display mode
- `CommentSection.tsx` — Comment list + input form
- `RecipeShareButton.tsx` — Toggle share with confirmation
- `CommunityRecipeCard.tsx` — Public recipe card with rating badge

**New pages:**
- `Community.tsx` — Browse public recipes
- `CommunityRecipeDetail.tsx` — Public recipe detail view

**Modified pages:**
- `RecipeForm.tsx` — Add `isPublic` toggle
- `RecipeDetail.tsx` — Add Share button + rating display
- `App.tsx` — Add community routes
- `Navbar.tsx` — Add "Community" nav link

---

### 7.7 Testing

**Backend:**
- Rating CRUD + upsert behavior
- Comment CRUD + owner-only deletion
- Community endpoint filtering, sorting, pagination
- Public recipe access without auth
- Private recipe blocked from community

**Frontend:**
- StarRating interactive + display modes
- CommentSection post/delete flow
- Community page search, filter, sort
- Share button toggle + confirmation
- Theme toggle persists across navigation

---

## Non-Functional Requirements

- All new endpoints follow existing Express + TypeScript patterns
- All new components follow existing React + Vite patterns
- CSS variables ensure zero-flash theme switching
- High contrast mode passes WCAG AAA (7:1 contrast ratio)
- Community page is fully responsive (mobile-first)
- All changes maintain existing 114+ frontend test pass rate
- Docker verification remains hard gate for each sprint
