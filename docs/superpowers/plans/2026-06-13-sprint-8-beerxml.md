# Sprint 8 Plan: BeerXML Import/Export

**Version:** v0.5.0
**Branch:** `sprint-8`
**Date:** June 13, 2026
**Team:** NES Team (Cody lead, Forge, Spark, Sentinel, Sync, Grid)

## Goal

Enable brewers to import recipes from Brewfather, BeerSmith, and other BeerXML-compatible tools, and export BrewBuddy recipes as BeerXML for portability.

## Success Criteria

- [ ] Import BeerXML files via POST /api/recipes/import
- [ ] Export recipes as BeerXML via GET /api/recipes/:id/export
- [ ] Frontend upload UI with drag-and-drop and preview
- [ ] Export button on RecipeDetail page
- [ ] XML security: external entity processing disabled
- [ ] File size limit: 1MB max
- [ ] Graceful handling of missing/optional fields
- [ ] All existing tests still pass
- [ ] New tests for import/export
- [ ] Docker verified

## Tasks

### Task 1: Install xml2js + types (Forge)
- Install `xml2js` and `@types/xml2js` in backend
- Verify build still works
- **Files:** `backend/package.json`

### Task 2: BeerXML parser service (Cody)
- Create `backend/src/services/BeerXMLParser.ts`
- Parse BeerXML string → structured JS object
- Map BeerXML fields to BrewBuddy Recipe model
- Disable external entity processing (XXE protection)
- Handle missing optional fields gracefully
- **Files:** `backend/src/services/BeerXMLParser.ts`

### Task 3: Import endpoint (Forge)
- POST `/api/recipes/import` — accepts multipart/form-data or JSON with XML string
- Validates XML structure
- Returns parsed recipe for preview before save
- POST `/api/recipes/import/confirm` — saves the previewed recipe
- **Files:** `backend/src/routes/recipes.ts`

### Task 4: Export endpoint (Cody)
- GET `/api/recipes/:id/export` — returns BeerXML content-type
- Maps BrewBuddy recipe fields → BeerXML structure
- Includes hops, fermentables, yeast, mash profile
- **Files:** `backend/src/routes/recipes.ts`, `backend/src/services/BeerXMLParser.ts`

### Task 5: Frontend import UI (Spark)
- Import button on RecipeList page
- Drag-and-drop upload zone + file picker
- Preview parsed recipe before confirming import
- Confirm → calls import/confirm endpoint → navigates to new recipe
- **Files:** `frontend/src/pages/ImportRecipe.tsx`, `frontend/src/App.tsx`

### Task 6: Export button on RecipeDetail (Spark)
- "Export BeerXML" button on RecipeDetail page
- Triggers download of .xml file
- **Files:** `frontend/src/pages/RecipeDetail.tsx`, `frontend/src/services/api.ts`

### Task 7: Error handling + security (Sentinel)
- XML entity expansion protection
- File size validation (1MB max)
- Malformed XML error messages
- Backend + frontend error boundaries
- **Files:** `backend/src/services/BeerXMLParser.ts`, `backend/src/routes/recipes.ts`

### Task 8: Backend integration tests (Sync)
- Test BeerXML parsing (valid XML, missing fields, malformed XML)
- Test import endpoint (valid file, oversized file, invalid XML)
- Test export endpoint (existing recipe, non-existent recipe)
- **Files:** `backend/src/__tests__/BeerXML.test.ts`

### Task 9: Frontend integration tests (Sync)
- Test import page renders
- Test file upload flow
- Test preview display
- Test export button triggers download
- **Files:** `frontend/__tests__/ImportRecipe.test.tsx`, `frontend/__tests__/ExportRecipe.test.tsx`

### Task 10: Docker verify + VERSION bump + tag (Grid)
- Rebuild Docker containers from scratch
- Verify all tests pass
- Bump VERSION to 0.5.0
- Tag `sprint-8`
- Merge to main with --no-ff

## Execution Order

```
Wave 1 (Backend Foundation):
  Task 1 (Forge) ──→ Task 2 (Cody) ──→ Task 3 (Forge)
                                    └──→ Task 4 (Cody)

Wave 2 (Frontend - parallel with Wave 1):
  Task 5 (Spark) ──→ Task 6 (Spark)

Wave 3 (Quality):
  Task 7 (Sentinel) ──→ Task 8 (Sync) ──→ Task 9 (Sync)

Wave 4 (Ship):
  Task 10 (Grid)
```

## BeerXML Field Mapping

### Import (BeerXML → BrewBuddy)

| BeerXML | BrewBuddy |
|---------|-----------|
| NAME | recipeName |
| STYLE.NAME | style |
| TYPE | method (map: "All Grain"→all_grain, "Extract"→extract, "Partial Mash"→partial) |
| BATCH_SIZE | batchSize (L) |
| BOIL_TIME | boilTimeMinutes |
| EFFICIENCY | efficiency |
| BREWER | notes (prepend) |
| NOTES | notes |
| HOPS/HOP[] | hops[] (name, alpha, amount, time, use, form) |
| FERMENTABLES/FERMENTABLE[] | grains[] (name, amount, color, yield) |
| YEASTS/YEAST[] | yeast[] (name, amount, type, form, lab, productId) |
| MASH/MASH_STEPS/MASH_STEP[] | mashSteps[] (name, type, stepTemp, stepTime) |
| OG | estimatedOg |
| FG | estimatedFg |

### Export (BrewBuddy → BeerXML)

Reverse mapping of above, wrapping in BeerXML envelope:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<RECIPES>
  <RECIPE>
    <!-- mapped fields -->
  </RECIPE>
</RECIPES>
```
