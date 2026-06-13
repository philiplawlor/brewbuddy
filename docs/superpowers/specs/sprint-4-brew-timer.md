# Sprint 4: Brew Timer UI — Design Spec

## Architecture
**Client-side timer** — React state + localStorage, no server dependency for countdown.

## Components

### BrewTimerPage
- Main timer view, phone-first layout
- Shows: current step, countdown, hop callout, upcoming timeline
- FAB for event logging

### StepTimer
- Large countdown display (72px font)
- Pause/resume/skip controls
- Visual progress bar

### HopCallout
- Shows next hop addition (type, weight, time remaining)
- Auto-triggers at hop time

### EventLogger
- FAB (+) button, always visible
- Modal for logging: gravity, temp, notes, mash pH, volume
- Timestamps auto-captured

### AudioAlerts
- User-configurable: sound, vibration, visual-only
- Default: all three enabled
- Triggers: step changes, hop additions, timer complete

### BrewSessionStart
- Select recipe from list
- Pre-fills mash/boil times and hop additions
- Creates BrewSession via API

## Data Flow
1. Start: User selects recipe → POST /api/brew-sessions → response creates session
2. Timer: React useEffect + useRef for countdown
3. Persistence: localStorage backup (survives refresh)
4. Events: POST /api/brew-sessions/:id/events (when online)
5. Step progression: Mash → Boil → Whirlpool → Cool

## State Shape
```typescript
interface TimerState {
  sessionId: string;
  currentStep: string;
  timeRemaining: number; // seconds
  isRunning: boolean;
  hopAdditions: HopAddition[];
  events: SessionEvent[];
}
```
