# Sprint 6: UI Polish & Design System Refinement

**Sprint Number:** 6  
**Version:** 0.3.0  
**Estimated Units:** 5 (20 hours)  
**Status:** PLANNING  

---

## Executive Summary

Sprint 5 established the Craft Brewery Taproom aesthetic with a dark theme, amber accents, and glass morphism. Sprint 6 refines this foundation by eliminating design anti-patterns identified by the Impeccable and Frontend Design skills, introducing a more distinctive visual identity, and adding purposeful motion.

---

## Design Law Audit (Current State)

### Violations Identified

| Violation | Location | Severity | Fix |
|-----------|----------|----------|-----|
| **Gradient text** | Landing hero "Brew Better", page titles | HIGH | Replace with solid accent color or weight contrast |
| **Glassmorphism as default** | All cards, nav, modals | HIGH | Use solid surfaces with subtle elevation |
| **Identical card grids** | Landing features, RecipeList, BrewSessionList | HIGH | Vary card sizes, use asymmetric layouts |
| **Hero-metric template** | Landing stats section | MEDIUM | Redesign with contextual layout |
| **Near-black background (#0a0a0a)** | Global body | MEDIUM | Tint toward brand hue (warm brown undertone) |
| **Generic body font (Inter)** | Global body | MEDIUM | Replace with distinctive display+body pairing |
| **No atmosphere/texture** | All pages | MEDIUM | Add grain overlay, subtle patterns |
| **Predictable centered layouts** | Login, Register, forms | LOW | Introduce asymmetry, split-screen layouts |

### What's Working

- **Dark theme appropriate**: Brewery taproom vibe fits the product
- **Amber accent strategy**: Single accent at ~10% usage is correct for Restrained mode
- **Oswald display font**: Distinctive and on-brand
- **Phone-first timer**: Timer UI is functional and well-structured

---

## Aesthetic Direction

### Concept: "Craft & Grain"

**Physical scene:** A brewer working in a dimly lit taproom, amber light filtering through copper vessels, wood grain textures on the bar, handwritten labels on bottles. The warmth of craft, the honesty of materials.

**Color strategy:** Restrained with warm depth. Tinted neutrals toward warm brown (not pure gray). Single amber accent used deliberately.

**Typography:** Oswald for display (already working), replace Inter with **DM Sans** for body (geometric but warm, not sterile).

**Atmosphere:** Subtle grain texture overlay, warm shadows, tactile hover states.

---

## Implementation Tasks

### Task 1: Color System Refinement (Unit 1)

**Goal:** Replace near-black backgrounds with warm-tinted neutrals using OKLCH.

**Files to modify:**
- `frontend/tailwind.config.js`
- `frontend/src/styles/global.css`

**Changes:**
1. Convert color palette to OKLCH values
2. Replace `#0a0a0a` with warm-tinted dark: `oklch(0.15 0.01 60)` (dark brown undertone)
3. Replace `#1a1a1a` with `oklch(0.20 0.008 60)`
4. Replace `#2a2a2a` with `oklch(0.28 0.006 60)`
5. Replace `#fafafa` with warm white: `oklch(0.97 0.005 80)`
6. Replace `#a3a3a3` with warm gray: `oklch(0.70 0.01 70)`
7. Keep amber accent but refine: `oklch(0.75 0.15 70)`
8. Add semantic color tokens for states (success, error, warning)

**Acceptance Criteria:**
- [ ] All hex colors replaced with OKLCH
- [ ] Backgrounds have visible warm undertone
- [ ] Text remains readable (WCAG AA contrast)
- [ ] No pure black or pure white anywhere

---

### Task 2: Typography Overhaul (Unit 1-2)

**Goal:** Replace Inter with DM Sans, improve type scale hierarchy.

**Files to modify:**
- `frontend/tailwind.config.js`
- `frontend/src/styles/global.css`
- `frontend/index.html`

**Changes:**
1. Add DM Sans font import (weights: 400, 500, 600, 700)
2. Replace Inter with DM Sans as body font
3. Increase type scale ratio to ≥1.25 between steps
4. Add line-height tokens for different contexts
5. Cap body line length at 65ch with max-width utility

**New type scale:**
```
Display:  Oswald 700 (hero, page titles)
H1:       Oswald 600 (section headers)
H2:       Oswald 500 (sub-sections)
H3:       DM Sans 600 (card titles)
Body:     DM Sans 400 (paragraphs, labels)
Caption:  DM Sans 400 small (metadata, timestamps)
```

**Acceptance Criteria:**
- [ ] DM Sans loaded and applied to body
- [ ] Type hierarchy visually clear at 1.25+ ratio
- [ ] Line lengths capped at 65ch
- [ ] Font loading doesn't cause layout shift

---

### Task 3: Remove Gradient Text (Unit 2)

**Goal:** Eliminate gradient text anti-pattern across all pages.

**Files to modify:**
- `frontend/src/pages/Landing.tsx`
- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/Register.tsx`
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/RecipeForm.tsx`
- `frontend/src/styles/global.css`

**Changes:**
1. Remove `.gradient-text` class from global.css
2. Replace all `gradient-text` usage with solid amber color
3. For emphasis, use weight contrast (700 vs 400) instead of color gradient
4. Update Tailwind config to remove gradient utilities if unused

**Before:**
```html
<span class="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Brew Better</span>
```

**After:**
```html
<span class="text-amber-500 font-bold">Brew Better</span>
```

**Acceptance Criteria:**
- [ ] Zero instances of `gradient-text` class
- [ ] Zero instances of `background-clip: text`
- [ ] Emphasis conveyed through weight/size, not color gradient

---

### Task 4: Card Design System (Unit 2-3)

**Goal:** Replace identical glass cards with varied, tactile surfaces.

**Files to modify:**
- `frontend/src/components/UI/Card.tsx`
- `frontend/src/pages/Landing.tsx`
- `frontend/src/pages/RecipeList.tsx`
- `frontend/src/pages/BrewSessionList.tsx`
- `frontend/src/pages/RecipeDetail.tsx`

**Changes:**
1. Redesign Card component with solid surfaces (remove glass/blur)
2. Add card variants: `elevated`, `outlined`, `filled`, `interactive`
3. Add subtle warm shadow instead of blur backdrop
4. Create asymmetric grid layouts for feature sections
5. Add hover state with warm glow (not translateY transform)

**Card design tokens:**
```css
--card-bg: oklch(0.22 0.008 60);
--card-border: oklch(0.30 0.01 60);
--card-shadow: 0 4px 24px oklch(0.10 0.01 60 / 0.4);
--card-hover-shadow: 0 8px 32px oklch(0.75 0.15 70 / 0.15);
```

**Landing page features section:**
- Replace 4 identical cards with asymmetric layout
- First card: large, spans 2 columns
- Remaining 3: stacked or varied sizes
- Each card gets unique visual treatment (different border accent positions)

**Acceptance Criteria:**
- [ ] Glass/blur removed from all cards
- [ ] Card variants implemented
- [ ] Hover states use warm glow, not translateY
- [ ] Feature section uses asymmetric layout
- [ ] No two cards look identical

---

### Task 5: Atmosphere & Texture (Unit 3)

**Goal:** Add grain texture and warm depth to all surfaces.

**Files to modify:**
- `frontend/src/styles/global.css`
- `frontend/src/pages/Landing.tsx`

**Changes:**
1. Create SVG grain texture (noise pattern)
2. Add grain overlay utility class with CSS
3. Apply subtle grain to body background
4. Add warm ambient glow behind hero sections
5. Create texture for card surfaces (optional, per variant)

**Grain implementation:**
```css
.grain::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* noise SVG */
  opacity: 0.03;
  pointer-events: none;
  z-index: 9999;
}
```

**Acceptance Criteria:**
- [ ] Grain texture visible on close inspection
- [ ] Texture doesn't affect readability
- [ ] Performance impact < 1ms per frame
- [ ] Grain intensity adjustable via CSS variable

---

### Task 6: Login/Register Split Layout (Unit 3-4)

**Goal:** Replace centered card with asymmetric split-screen layout.

**Files to modify:**
- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/Register.tsx`

**Layout concept:**
```
┌─────────────────────────────────────────────┐
│                    │                         │
│   BREWBUDDY        │      Welcome Back       │
│   (large logo,     │      [Form fields]      │
│    tagline,        │      [Sign In button]    │
│    ambient glow)   │      [Register link]     │
│                    │                         │
└─────────────────────────────────────────────┘
```

**Changes:**
1. Split layout: 40% branding, 60% form
2. Left side: Large Oswald title, tagline, warm ambient glow
3. Right side: Form with refined inputs
4. Mobile: Stack vertically with form on top
5. Add subtle entrance animation for form fields (stagger)

**Acceptance Criteria:**
- [ ] Split layout on desktop (≥1024px)
- [ ] Stacked layout on mobile
- [ ] Form fields animate in with stagger
- [ ] Branding side has atmospheric glow
- [ ] No glass/blur on form card

---

### Task 7: Landing Page Hero Redesign (Unit 4)

**Goal:** Replace predictable hero with atmospheric, asymmetric design.

**Files to modify:**
- `frontend/src/pages/Landing.tsx`

**Changes:**
1. Remove gradient text from "Brew Better"
2. Add warm ambient glow behind title (radial gradient)
3. Break symmetry: offset title left, CTA right
4. Add grain texture overlay
5. Replace identical feature cards with varied layout
6. Redesign stats section (remove hero-metric template)

**Stats redesign concept:**
Instead of 4 identical big-number-small-label blocks, use an inline format:
```
Crafted 12+ beer styles · 5 smart calculations · 100% free & open source
```

**Acceptance Criteria:**
- [ ] No gradient text
- [ ] Title has warm ambient glow
- [ ] Layout is asymmetric (not centered)
- [ ] Stats are inline, not card grid
- [ ] Grain texture visible

---

### Task 8: Motion & Micro-interactions (Unit 4-5)

**Goal:** Add purposeful animations that enhance usability.

**Files to modify:**
- `frontend/src/styles/global.css`
- `frontend/tailwind.config.js`
- Various page components

**Changes:**
1. Add page transition animations (fade + slight rise)
2. Add stagger animation for lists (recipes, sessions)
3. Add warm glow pulse on primary buttons (subtle)
4. Add focus ring animation (smooth expand)
5. Add loading skeleton with warm shimmer

**Animation tokens:**
```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
```

**Acceptance criteria:**
- [ ] Page transitions use ease-out-expo
- [ ] Lists animate in with stagger
- [ ] Focus rings animate smoothly
- [ ] No layout property animations (transform/opacity only)
- [ ] All animations respect prefers-reduced-motion

---

### Task 9: RecipeDetail Tab Polish (Unit 5)

**Goal:** Refine the tabbed interface with better visual hierarchy.

**Files to modify:**
- `frontend/src/pages/RecipeDetail.tsx`

**Changes:**
1. Replace glass tab bar with solid surface
2. Add active indicator (amber underline with glow)
3. Improve tab content spacing
4. Add transition between tab content
5. Refine ingredient list styling (remove nested cards)

**Acceptance Criteria:**
- [ ] Tabs use solid surfaces
- [ ] Active tab has amber indicator
- [ ] Tab content transitions smoothly
- [ ] No nested cards in ingredient display

---

### Task 10: Update Tests & Documentation (Unit 5)

**Goal:** Update tests for any changed selectors, document design system.

**Files to modify:**
- `frontend/__tests__/*.test.tsx` (as needed)
- `docs/sprints/sprint-6/RESULTS.md`
- `VERSION` (bump to 0.3.0)

**Changes:**
1. Update tests for any changed text/selectors
2. Run full test suite, ensure 100% pass
3. Docker verification (hard gate)
4. Write RESULTS.md with before/after screenshots
5. Tag sprint-6, merge to main
6. Bump VERSION to 0.3.0

**Acceptance Criteria:**
- [ ] All tests passing
- [ ] Docker services healthy
- [ ] RESULTS.md complete with screenshots
- [ ] Git tag sprint-6 created
- [ ] VERSION bumped to 0.3.0

---

## Task Dependencies

```
Task 1 (Color) → Task 2 (Typography) → Task 3 (Gradient Text) → Task 4 (Cards) → Task 5 (Texture)
                                                                                      ↓
Task 6 (Login/Register) ← Task 7 (Landing) ← Task 8 (Motion) ← Task 9 (Tabs) ← Task 10 (Tests)
```

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| OKLCH browser support | Low | Medium | Fallback to HSL for older browsers |
| DM Sans loading delay | Medium | Low | Use `font-display: swap` |
| Grain texture performance | Low | Low | Keep opacity ≤0.05, test on mobile |
| Animation motion sickness | Medium | Medium | Always respect `prefers-reduced-motion` |

---

## Success Metrics

- [ ] Zero gradient text instances
- [ ] Zero glass/blur card instances
- [ ] All backgrounds use OKLCH with warm undertone
- [ ] Body font is DM Sans (not Inter)
- [ ] All pages have grain texture
- [ ] Login/Register use split layout
- [ ] All tests passing
- [ ] Docker verification passed

---

## NES Team Approval

| Role | Name | Status |
|------|------|--------|
| CEO | Apex | PENDING |
| CFO | Ledger | PENDING |
| COO | Forge | PENDING |
| CPO | Percy | PENDING |
| PM | Sync | PENDING |
| CMO | Spark | PENDING |
| CTO | Cody | PENDING |
| DevOps | Grid | PENDING |
| CISO | Sentinel | PENDING |
| Risk | Penny | PENDING |
