# Sprint 3: Brew Day Timer (v0.1.3)

**Version:** 0.1.3
**Branch:** `sprint-3`
**Status:** 🔄 IN PROGRESS
**Date:** June 10, 2026

---

## Goal

Build the Brew Day Timer feature — guided step-by-step brew sessions with countdown timers, event logging, and a brew day calendar.

---

## User Stories

1. As a brewer, I want to start a brew session from a recipe so I can track my brew day
2. As a brewer, I want step-by-step guidance (Mash → Boil → Whirlpool → Cool) with countdown timers
3. As a brewer, I want audio alerts when a step completes so I don't miss additions
4. As a brewer, I want to log events (gravity readings, temperature, notes) during my brew day
5. As a brewer, I want to see my brew history and upcoming sessions on a calendar
6. As a brewer, I want to pause a timer until I confirm the step is complete

---

## Tasks

### Task 1: BrewSession + SessionEvent Mongoose Models
**Unit Estimate:** 2 units
**Status:** ⬜ NOT STARTED

**Files to create:**
- `backend/src/models/BrewSession.ts`
- `backend/src/models/SessionEvent.ts`
- `backend/__tests__/brew-session.test.ts`

**Requirements:**
- BrewSession model per PRD schema (userId, recipeId, batchNumber, status, brewDate, actual readings, timing, notes)
- Status enum: `planned`, `in_progress`, `fermenting`, `conditioning`, `bottled`, `consumed`
- SessionEvent model (sessionId, eventType, timestamp, details)
- Event types: `mash_in`, `mash_step`, `mash_out`, `vorlauf`, `sparge`, `boil_start`, `hop_addition`, `whirlpool`, `flameout`, `chill`, `pitch_yeast`, `transfer`
- Indexes on userId, recipeId, status, brewDate
- Unit tests for both models (field validation, defaults, indexes)

**Tests:**
- BrewSession: create, required fields, status enum validation, default values, indexes
- SessionEvent: create, required fields, eventType enum validation

---

### Task 2: Brew Session CRUD API
**Unit Estimate:** 2 units
**Status:** ⬜ NOT STARTED

**Files to create:**
- `backend/src/routes/brew-sessions.ts`
- `backend/__tests__/brew-sessions-crud.test.ts`

**Files to modify:**
- `backend/src/index.ts` (register route)

**Requirements:**
- `POST /api/brew-sessions` — Create brew session (link to recipe)
- `GET /api/brew-sessions` — List user's brew sessions (filter by status, pagination)
- `GET /api/brew-sessions/:id` — Get brew session with events
- `PUT /api/brew-sessions/:id` — Update brew session (status, actual readings, notes)
- `DELETE /api/brew-sessions/:id` — Delete brew session
- `POST /api/brew-sessions/:id/events` — Log event to session
- `GET /api/brew-sessions/:id/events` — List events for session
- All endpoints require JWT auth
- Input validation with express-validator

**Tests:**
- CRUD operations: create, read, update, delete
- Event logging: add event, list events
- Auth: reject unauthenticated requests
- Validation: reject invalid status transitions

---

### Task 3: Brew Day Timer Engine
**Unit Estimate:** 3 units
**Status:** ⬜ NOT STARTED

**Files to create:**
- `backend/src/services/BrewTimer.ts`
- `backend/__tests__/brew-timer.test.ts`

**Requirements:**
- Step progression logic: Mash → Boil → Whirlpool → Cool & Transfer
- Timer state management: `idle`, `running`, `paused`, `completed`
- Countdown calculation based on recipe parameters
- Step definitions with durations:
  - Mash: configurable (default 60 min)
  - Boil: configurable (default 60 min, hop additions at intervals)
  - Whirlpool: configurable (default 15 min)
  - Cool: until target temperature reached
- Pause/resume functionality
- Event generation on step transitions
- Auto-log `boil_start`, `hop_addition`, `whirlpool`, `flameout`, `chill` events

**Tests:**
- Timer state transitions
- Step progression
- Pause/resume
- Event generation
- Edge cases: step skip, manual override

---

### Task 4: Brew Session Frontend — List + Detail
**Unit Estimate:** 2 units
**Status:** ⬜ NOT STARTED

**Files to create:**
- `frontend/src/pages/BrewSessionList.tsx`
- `frontend/src/pages/BrewSessionDetail.tsx`
- `frontend/src/components/BrewSessionCard.tsx`
- `frontend/src/components/BrewStepProgress.tsx`
- `frontend/__tests__/BrewSessionList.test.tsx`
- `frontend/__tests__/BrewSessionDetail.test.tsx`

**Files to modify:**
- `frontend/src/App.tsx` (add routes)
- `frontend/src/services/api.ts` (add brew session endpoints)
- `frontend/src/types/index.ts` (add BrewSession types)

**Requirements:**
- BrewSessionList: calendar view + list view, filter by status
- BrewSessionCard: recipe name, brew date, status badge, batch number
- BrewSessionDetail: session info, event timeline, links to timer
- BrewStepProgress: visual step indicator (Mash → Boil → Whirlpool → Cool)
- Responsive design with Tailwind

**Tests:**
- Component rendering
- User interactions
- Status display

---

### Task 5: Brew Day Timer UI
**Unit Estimate:** 3 units
**Status:** ⬜ NOT STARTED

**Files to create:**
- `frontend/src/pages/BrewTimer.tsx`
- `frontend/src/components/CountdownTimer.tsx`
- `frontend/src/components/StepControls.tsx`
- `frontend/src/components/EventLog.tsx`
- `frontend/__tests__/BrewTimer.test.tsx`
- `frontend/__tests__/CountdownTimer.test.tsx`

**Requirements:**
- BrewTimer: main timer page with large countdown display
- CountdownTimer: big数字 visible at arm's length, MM:SS format
- StepControls: next/previous step, pause/resume, confirm step complete
- EventLog: scrollable log of brew day events with timestamps
- Audio alert on step completion (Web Audio API beep)
- Auto-advance to next step after confirmation
- Mobile-friendly — works on phone/tablet during brew day

**Tests:**
- Timer rendering
- Countdown accuracy
- Step navigation
- Audio alert trigger
- Pause/resume behavior

---

### Task 6: Brew Session API Integration + Search
**Unit Estimate:** 2 units
**Status:** ⬜ NOT STARTED

**Files to modify:**
- `backend/src/routes/brew-sessions.ts` (add search/filter)
- `backend/__tests__/brew-sessions-search.test.ts`

**Requirements:**
- Search brew sessions by recipe name, batch number
- Filter by status
- Pagination support
- Sort by brew date (newest first)
- Upcoming sessions endpoint

**Tests:**
- Search functionality
- Filter by status
- Pagination

---

### Task 7: Docker Verification + Integration Tests
**Unit Estimate:** 1 unit
**Status:** ⬜ NOT STARTED

**Requirements:**
- All backend tests pass (target: 220+)
- All frontend tests pass (target: 100+)
- Docker dev stack builds and runs
- Health checks pass
- Verify brew session API endpoints work end-to-end
- Update `scripts/verify-sprint.sh` if needed

---

## Total Unit Estimate: 15 units (~60 hours)

> Note: This is aggressive for a 5-unit sprint. Tasks 1-4 are core (MVP), Tasks 5-7 can be deferred to Sprint 4 if needed. Recommend prioritizing Tasks 1-4 for this sprint.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Timer UI too complex | Medium | High | Simplify to basic countdown, defer audio alerts |
| Brew step definitions vary widely | High | Medium | Use configurable step templates, not hardcoded |
| Mobile responsiveness | Medium | Medium | Test on real devices, use Tailwind responsive classes |
| Scope creep from PRD features | High | High | Stick to timer + session CRUD only, defer fermentation tracking |

---

## Acceptance Criteria

- [ ] BrewSession + SessionEvent models with unit tests
- [ ] Brew Session CRUD API with JWT auth
- [ ] Brew Day Timer engine with step progression
- [ ] Brew Session list + detail pages
- [ ] Brew Timer UI with countdown + step controls
- [ ] All tests passing
- [ ] Docker verification passing
- [ ] RESULTS.md documented
- [ ] Git tagged as `sprint-3`
- [ ] Merged to main

---

*Planned by Sync (PM) - New England Sales Team*
