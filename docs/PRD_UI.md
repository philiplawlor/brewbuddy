# BrewBuddy - UI/UX Requirements

**Version:** 0.1.0
**Design Philosophy:** Modern, clean, mobile-first with Brewfather-level polish

---

## 1. Design Principles

### 1.1 Core Principles

1. **Clarity First** — Every screen has one primary action
2. **Progressive Disclosure** — Show essentials first, details on demand
3. **Touch-Optimized** — 48dp minimum touch targets
4. **Accessible** — WCAG 2.1 AA compliance
5. **Dark Mode Native** — Not an afterthought

### 1.2 Visual Language

| Element | Specification |
|---------|---------------|
| Border Radius | 8px (cards), 6px (buttons), 4px (inputs) |
| Spacing Scale | 4px, 8px, 12px, 16px, 24px, 32px, 48px |
| Font Size Scale | 12px, 14px, 16px, 18px, 20px, 24px, 32px |
| Max Content Width | 1200px |
| Card Shadow | 0 2px 8px rgba(0,0,0,0.1) |
| Transition Speed | 150ms (micro), 250ms (macro) |

### 1.3 Color Palette

**Light Mode:**
| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#2563EB` | Primary actions, links |
| `--primary-hover` | `#1D4ED8` | Hover state |
| `--secondary` | `#10B981` | Success, fermentation |
| `--warning` | `#F59E0B` | Alerts, warnings |
| `--danger` | `#EF4444` | Errors, deletions |
| `--bg` | `#FFFFFF` | Page background |
| `--surface` | `#F9FAFB` | Card background |
| `--text` | `#111827` | Primary text |
| `--text-secondary` | `#6B7280` | Secondary text |

**Dark Mode:**
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#111827` | Page background |
| `--surface` | `#1F2937` | Card background |
| `--text` | `#F9FAFB` | Primary text |
| `--text-secondary` | `#9CA3AF` | Secondary text |

### 1.4 Beer Color System

| SRM Range | Color | Usage |
|-----------|-------|-------|
| 1-3 | Straw (#FFE680) | Light Lagers, Witbier |
| 4-6 | Gold (#FFD54F) | Pilsners, Blonde Ales |
| 7-10 | Amber (#FFA726) | Amber Ales, Oktoberfest |
| 11-14 | Copper (#E65100) | Amber IPAs, Brown Ales |
| 15-20 | Brown (#5D4037) | Browns, Porters |
| 21-30 | Dark Brown (#3E2723) | Stouts, Porters |
| 31-40 | Very Dark (#1B0000) | Imperial Stouts |
| 40+ | Black (#000000) | Black IPAs, Stouts |

---

## 2. Screen Inventory

### 2.1 Complete Screen List

| Screen | Route | Description |
|--------|-------|-------------|
| **Dashboard** | `/` | Overview of all batches, quick stats |
| **Recipes List** | `/recipes` | All recipes with search/filter |
| **Recipe Designer** | `/recipes/new` | Create new recipe |
| **Recipe Detail** | `/recipes/:id` | View/edit recipe |
| **Recipe Import** | `/recipes/import` | Import BeerXML/BeerJSON |
| **Brew Sessions List** | `/sessions` | All brew sessions |
| **Brew Day** | `/sessions/:id/brew` | Brew day tracker (timer) |
| **Session Detail** | `/sessions/:id` | Session overview |
| **Fermentation Tracker** | `/sessions/:id/fermentation` | Fermentation logging |
| **Water Profiles** | `/water` | Water chemistry profiles |
| **Water Calculator** | `/water/calculator` | Additive calculator |
| **Inventory** | `/inventory` | Ingredient inventory |
| **Shopping Lists** | `/shopping` | Shopping lists |
| **Equipment** | `/equipment` | Brewing equipment |
| **Devices** | `/devices` | IoT device management |
| **Brew Clubs** | `/clubs` | Club management |
| **Club Detail** | `/clubs/:id` | Club overview |
| **Competitions** | `/competitions` | Competition management |
| **Settings** | `/settings` | User preferences |
| **Profile** | `/profile` | User profile |

---

## 3. Screen Specifications

### 3.1 Dashboard

**Purpose:** At-a-glance overview of brewing activity

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  BrewBuddy Logo          [Search] [User Avatar] │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Quick Stats                            │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │   │
│  │  │Active│ │Fermt │ │Planned│ │Done  │  │   │
│  │  │  2   │ │  3   │ │  1   │ │  12  │  │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Active Brew Sessions                   │   │
│  │  ┌────────────────────────────────────┐ │   │
│  │  │ 🍺 Summer IPA Batch #42           │ │   │
│  │  │ Status: Boiling | 45:00 remaining │ │   │
│  │  │ [View Brew Day]                    │ │   │
│  │  └────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────┐ │   │
│  │  │ 🍺 Winter Stout Batch #41         │ │   │
│  │  │ Status: Fermenting | Day 5        │ │   │
│  │  │ SG: 1.018 | Temp: 19°C           │ │   │
│  │  └────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Upcoming Actions                       │   │
│  │  • Dry hop IPA - Tomorrow              │   │
│  │  • Bottle Stout - June 15              │   │
│  │  • Restock Hops - 2 items low          │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Recent Recipes                         │   │
│  │  [Card] [Card] [Card] [Card]           │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Inventory Alerts                       │   │
│  │  ⚠️ Cascade Hops - 50g remaining       │   │
│  │  ⚠️ US-05 Yeast - Expired              │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
├─────────────────────────────────────────────────┤
│  [🏠] [🍺] [📋] [💧] [📦] [⚙️]              │
│  Home  Recipes Sessions Water  Inventory Settings│
└─────────────────────────────────────────────────┘
```

**Components:**
- Quick Stats Cards (4 across)
- Active Brew Sessions List
- Upcoming Actions List
- Recent Recipes Carousel
- Inventory Alerts

---

### 3.2 Recipe Designer

**Purpose:** Create and edit recipes with real-time calculations

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  ← Back        Recipe Designer      [Save] [⋮] │
├─────────────────────────────────────────────────┤
│                                                 │
│  Recipe Name: [Summer IPA                    ]  │
│  Style: [American IPA ▼]  Method: [All Grain ▼]│
│  Batch Size: [20] L    Boil Time: [60] min     │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Style Ranges                           │   │
│  │  OG:  ████████████░░░░  1.065           │   │
│  │       [1.056 ───────●────── 1.070]      │   │
│  │  IBU: ██████████████░░  65              │   │
│  │       [40 ──────────●────── 70]         │   │
│  │  SRM: ████████████████  8               │   │
│  │       [6 ──────────────── 14]           │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Calculated Values                      │   │
│  │  OG: 1.065 | FG: 1.012 | ABV: 6.9%    │   │
│  │  IBU: 65 | SRM: 8 | Calories: 210      │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Fermentables                    [+]    │   │
│  │  ┌─────────────────────────────────────┐│   │
│  │  │ 🌾 2-Row Pale Malt    5.0kg   80%  ││   │
│  │  │ 🌾 Crystal 40L        0.5kg   8%   ││   │
│  │  │ 🌾 Munich Malt        0.4kg   6%   ││   │
│  │  │ 🌾 Carapils           0.3kg   5%   ││   │
│  │  │ 🌾 Wheat Malt         0.1kg   1%   ││   │
│  │  └─────────────────────────────────────┘│   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Hops                              [+]   │   │
│  │  ┌─────────────────────────────────────┐│   │
│  │  │ 🌿 Cascade         28g  60min 5.5% ││   │
│  │  │ 🌿 Centennial      14g  15min 9.5% ││   │
│  │  │ 🌿 Cascade         28g  5min  5.5% ││   │
│  │  │ 🌿 Cascade         42g  Dry Hop     ││   │
│  │  └─────────────────────────────────────┘│   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Yeast                            [+]    │   │
│  │  ┌─────────────────────────────────────┐│   │
│  │  │ 🧫 Safale US-05       1 pack       ││   │
│  │  │    Ale | Attenuation: 73-77%       ││   │
│  │  └─────────────────────────────────────┘│   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Mash Profile                      [+]   │   │
│  │  ┌─────────────────────────────────────┐│   │
│  │  │ 1. Mash In      67°C    60 min     ││   │
│  │  │ 2. Mash Out     76°C    10 min     ││   │
│  │  └─────────────────────────────────────┘│   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Notes:                                         │
│  ┌─────────────────────────────────────────┐   │
│  │                                         │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
├─────────────────────────────────────────────────┤
│  [🏠] [🍺] [📋] [💧] [📦] [⚙️]              │
└─────────────────────────────────────────────────┘
```

**Features:**
- Real-time calculation updates as ingredients change
- Visual style range indicators (green when in range)
- Drag-and-drop reordering (desktop)
- Swipe-to-delete (mobile)
- Quick-add ingredient modals
- Save as template option
- Duplicate recipe

---

### 3.3 Brew Day Tracker

**Purpose:** Guided brew day with timers and step-by-step instructions

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  ← Back     Brew Day: Summer IPA    [⋮] Menu   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────┬──────┬──────┬──────┬──────┐          │
│  │Mash  │Boil  │Whirl │Cool  │Xfer  │          │
│  │  ✓   │  ●   │  ○   │  ○   │  ○   │          │
│  └──────┴──────┴──────┴──────┴──────┘          │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  CURRENT STEP                          │   │
│  │                                         │   │
│  │         ⏱️ 45:00                        │   │
│  │                                         │   │
│  │  Boil - Hop Addition                    │   │
│  │  Add Cascade Hops (28g)                 │   │
│  │                                         │   │
│  │  [▶️ Start] [⏸️ Pause] [⏭️ Skip]       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Upcoming                              │   │
│  │  • 15:00 - Add Centennial (14g)        │   │
│  │  • 05:00 - Add Cascade (28g)           │   │
│  │  • 00:00 - End Boil / Start Whirlpool  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Brew Log                              │   │
│  │  • 10:32 - Boil started                │   │
│  │  • 10:32 - Added Cascade 28g           │   │
│  │  • 10:00 - Mash complete               │   │
│  │  • 09:55 - Sparge complete             │   │
│  │  • 09:30 - Mash in                     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Quick Actions                         │   │
│  │  [📝 Add Note] [🌡️ Log Temp] [📊 Log SG]│   │
│  └─────────────────────────────────────────┘   │
│                                                 │
├─────────────────────────────────────────────────┤
│  [🏠] [🍺] [📋] [💧] [📦] [⚙️]              │
└─────────────────────────────────────────────────┘
```

**Timer Features:**
- Large countdown display (readable at arm's length)
- Audio alert when step complete
- Push notification when step complete
- Screen wake lock during active session
- Background timer (continues when app backgrounded)
- Manual time adjustment (pencil icon)
- Skip forward/backward between steps

**Stage Progression:**
1. **Mash** → Mash In, Mash Steps, Mash Out, Vorlauf, Sparge
2. **Boil** → Boil Start, Hop Additions (timed), Whirlpool, Flameout
3. **Cool** → Chilling, Transfer to Fermenter
4. **Ferment** → Pitch Yeast, Gravity Readings, Dry Hop, Packaging

---

### 3.4 Fermentation Tracker

**Purpose:** Monitor fermentation with charts and readings

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  ← Back     Fermentation: Summer IPA   [⋮]     │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Status: Primary Fermentation          │   │
│  │  Day: 5 | Target: 19°C | Current: 20°C │   │
│  │  OG: 1.065 | Current SG: 1.032         │   │
│  │  Attenuation: 51% | ABV: 4.3%          │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  📈 Fermentation Chart                  │   │
│  │  ┌─────────────────────────────────────┐│   │
│  │  │     *                               ││   │
│  │  │    * *                              ││   │
│  │  │   *   *                             ││   │
│  │  │  *     *                            ││   │
│  │  │ *       *───────                    ││   │
│  │  │*                                    ││   │
│  │  └─────────────────────────────────────┘│   │
│  │  [SG] [Temperature] [pH]               │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Today's Readings                      │   │
│  │  SG: [1.032]  Temp: [20]°C  pH: [4.2]  │   │
│  │  [Add Reading]                          │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Reading History                       │   │
│  │  Jun 08: SG 1.032 | 20°C | Day 5      │   │
│  │  Jun 07: SG 1.038 | 19°C | Day 4      │   │
│  │  Jun 06: SG 1.045 | 19°C | Day 3      │   │
│  │  Jun 05: SG 1.052 | 19°C | Day 2      │   │
│  │  Jun 04: SG 1.065 | 19°C | Day 1      │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Device: Tilt Hydrometer               │   │
│  │  Last Reading: 2 min ago               │   │
│  │  [Calibrate] [Settings]                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
├─────────────────────────────────────────────────┤
│  [🏠] [🍺] [📋] [💧] [📦] [⚙️]              │
└─────────────────────────────────────────────────┘
```

**Chart Features:**
- Interactive line chart (SG, Temperature, pH)
- Touch to see exact values at any point
- Zoom in/out
- Compare with target curve
- Export chart as image

---

### 3.5 Water Chemistry

**Purpose:** Manage water profiles and calculate additives

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  ← Back        Water Chemistry       [+] Add    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  My Water Profiles                     │   │
│  │  ┌─────────────────────────────────────┐│   │
│  │  │ 💧 City Water (Default)            ││   │
│  │  │    Ca: 80 | SO4: 40 | Cl: 30      ││   │
│  │  │    pH: 7.2                          ││   │
│  │  └─────────────────────────────────────┘│   │
│  │  ┌─────────────────────────────────────┐│   │
│  │  │ 💧 Well Water                       ││   │
│  │  │    Ca: 120 | SO4: 60 | Cl: 45      ││   │
│  │  │    pH: 7.8                          ││   │
│  │  └─────────────────────────────────────┘│   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Target Profiles (by Style)            │   │
│  │  [American IPA ▼]                       │   │
│  │                                         │   │
│  │  Ca: 75-150 ppm    SO4: 150-350 ppm   │   │
│  │  Mg: 10-30 ppm     Cl: 50-100 ppm     │   │
│  │  Na: 0-25 ppm      HCO3: 0-50 ppm     │   │
│  │  SO4:Cl Ratio: 2:1 to 3:1 (Hops)      │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Water Calculator                      │   │
│  │                                         │   │
│  │  Source: [City Water ▼]                │   │
│  │  Volume: [20] L                        │   │
│  │                                         │   │
│  │  Additions:                            │   │
│  │  ┌─────────────────────────────────────┐│   │
│  │  │ Gypsum (CaSO4)      [4.0] grams    ││   │
│  │  │ Calcium Chloride    [2.0] grams    ││   │
│  │  │ Epsom Salt          [0.0] grams    ││   │
│  │  │ Baking Soda         [0.0] grams    ││   │
│  │  │ Lactic Acid (88%)   [1.5] ml       ││   │
│  │  │ Campden Tablet      [0.5] tablet   ││   │
│  │  └─────────────────────────────────────┘│   │
│  │                                         │   │
│  │  Resulting Profile:                    │   │
│  │  Ca: 105 | SO4: 160 | Cl: 50         │   │
│  │  Target Mash pH: 5.3                   │   │
│  │  [Save Treatment]                      │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
├─────────────────────────────────────────────────┤
│  [🏠] [🍺] [📋] [💧] [📦] [⚙️]              │
└─────────────────────────────────────────────────┘
```

**Calculator Features:**
- Real-time profile calculation as additives change
- Visual comparison (source vs target vs result)
- pH prediction based on grain bill
- Save treatments for reuse
- Apply treatment to brew session

---

### 3.6 Inventory

**Purpose:** Track ingredients with quantities and costs

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  ← Back         Inventory     [🔍] [+] Add     │
├─────────────────────────────────────────────────┤
│                                                 │
│  [All] [Grains] [Hops] [Yeast] [Chemicals]    │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Search: [Search ingredients...]       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  🌾 Grains (12 items)                  │   │
│  │  ┌─────────────────────────────────────┐│   │
│  │  │ 2-Row Pale Malt                    ││   │
│  │  │ 10 kg on hand | $2.50/kg           ││   │
│  │  │ MoreBeer | Stored: Shelf           ││   │
│  │  │ [Edit] [Delete]                    ││   │
│  │  └─────────────────────────────────────┘│   │
│  │  ┌─────────────────────────────────────┐│   │
│  │  │ Crystal 40L          ⚠️ Low Stock   ││   │
│  │  │ 0.5 kg on hand | $4.00/kg          ││   │
│  │  │ MoreBeer | Stored: Shelf           ││   │
│  │  │ [Edit] [Delete]                    ││   │
│  │  └─────────────────────────────────────┘│   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  🌿 Hops (8 items)                     │   │
│  │  ┌─────────────────────────────────────┐│   │
│  │  │ Cascade Pellets                     ││   │
│  │  │ 200g on hand | $15.00/oz           ││   │
│  │  │ Yakima Valley | Stored: Freezer    ││   │
│  │  │ Alpha: 5.5% | Harvest: 2025       ││   │
│  │  │ [Edit] [Delete]                    ││   │
│  │  └─────────────────────────────────────┘│   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  📊 Total Value: $342.50              │   │
│  │  Low Stock: 3 items                    │   │
│  │  Expiring Soon: 1 item                 │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
├─────────────────────────────────────────────────┤
│  [🏠] [🍺] [📋] [💧] [📦] [⚙️]              │
└─────────────────────────────────────────────────┘
```

**Features:**
- Filter by type, supplier, storage location
- Sort by name, quantity, cost, date
- Low stock alerts with configurable thresholds
- Expiration date tracking
- Barcode scanning (mobile)
- Cost analytics (total value, cost per batch)

---

### 3.7 Mobile Navigation

**Bottom Navigation Bar:**
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              [Main Content Area]                │
│                                                 │
├─────────────────────────────────────────────────┤
│  [🏠]    [🍺]    [📋]    [💧]    [📦]         │
│  Home  Recipes Sessions Water  Inventory       │
└─────────────────────────────────────────────────┘
```

**Touch Targets:**
- All interactive elements ≥ 48dp (44pt iOS)
- Minimum spacing between targets: 8dp
- Active states with visual feedback

---

## 4. Component Library

### 4.1 Core Components

| Component | Description |
|-----------|-------------|
| Button | Primary, Secondary, Ghost, Danger variants |
| Input | Text, Number, Select, Checkbox, Radio |
| Card | Container with shadow, optional header/footer |
| Modal | Overlay dialog with backdrop |
| Toast | Non-blocking notification |
| Badge | Status indicator (color-coded) |
| Progress | Linear and circular progress indicators |
| Tabs | Horizontal tab navigation |
| Accordion | Collapsible content sections |
| Dropdown | Menu overlay for actions |
| Tooltip | Contextual information on hover |

### 4.2 Brewing-Specific Components

| Component | Description |
|-----------|-------------|
| Timer | Large countdown with controls |
| GravityChart | Interactive fermentation chart |
| BeerColorSwatch | SRM color visualization |
| StyleRangeBar | BJCP range indicator |
| IngredientRow | Draggable ingredient card |
| HopAdditionTimeline | Visual hop schedule |
| WaterProfileCard | Ion concentration display |
| ReadingEntry | Gravity/temperature input form |

### 4.3 Layout Components

| Component | Description |
|-----------|-------------|
| AppShell | Main layout with nav and content |
| Sidebar | Desktop navigation sidebar |
| BottomNav | Mobile bottom navigation |
| PageHeader | Title, breadcrumbs, actions |
| PageContent | Scrollable content area |
| ResponsiveGrid | 1-4 column responsive grid |

---

## 5. Responsive Behavior

### 5.1 Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, bottom nav |
| Tablet | 640-1024px | 2-column grid, collapsible sidebar |
| Desktop | > 1024px | 3-4 column grid, full sidebar |

### 5.2 Mobile Adaptations

| Element | Desktop | Mobile |
|---------|---------|--------|
| Navigation | Sidebar | Bottom tab bar |
| Recipe Grid | 3 columns | 1 column |
| Timer | Standard size | Large, full-width |
| Forms | Side-by-side | Stacked |
| Tables | Full table | Card layout |
| Modals | Centered | Bottom sheet |

---

## 6. Dark Mode

### 6.1 Implementation

- Detect system preference via `prefers-color-scheme`
- Manual toggle in settings
- Persist preference in localStorage
- Smooth transition between modes (250ms)

### 6.2 Dark Mode Adjustments

| Element | Light | Dark |
|---------|-------|------|
| Background | #FFFFFF | #111827 |
| Surface | #F9FAFB | #1F2937 |
| Border | #E5E7EB | #374151 |
| Text Primary | #111827 | #F9FAFB |
| Text Secondary | #6B7280 | #9CA3AF |
| Shadows | Subtle | More pronounced |

---

## 7. Animations

### 7.1 Micro-Interactions

| Interaction | Animation |
|-------------|-----------|
| Button press | Scale 0.98, 100ms |
| Card hover | Shadow lift, 150ms |
| Page transition | Fade in, 200ms |
| Modal open | Scale from 0.95, fade, 200ms |
| Toast enter | Slide from top, 250ms |
| Timer tick | Number flip animation |
| Progress update | Smooth width transition |

### 7.2 Brew Day Specific

| Element | Animation |
|---------|-----------|
| Timer warning | Pulse when < 1 min |
| Timer complete | Flash + vibrate |
| Step complete | Checkmark animation |
| Alert | Slide in from right |

---

## 8. Accessibility

### 8.1 Requirements

| Standard | Target |
|----------|--------|
| WCAG | 2.1 AA |
| Color Contrast | ≥ 4.5:1 (text), ≥ 3:1 (large text) |
| Keyboard Navigation | Full support |
| Focus Indicators | Visible on all elements |
| Screen Reader | ARIA labels on all interactive elements |
| Reduced Motion | Respect `prefers-reduced-motion` |

### 8.2 ARIA Patterns

| Pattern | Usage |
|---------|-------|
| `role="timer"` | Brew day countdown |
| `role="progressbar"` | Fermentation progress |
| `aria-live="polite"` | Timer updates |
| `aria-label` | Icon-only buttons |
| `aria-describedby` | Form field descriptions |

---

## 9. Mobile-Specific Requirements

### 9.1 Brew Day Mobile

| Requirement | Implementation |
|-------------|----------------|
| Screen Wake | `wake-lock` API during active session |
| Background Timer | Service Worker for reliable notifications |
| Push Notifications | Step alerts, temperature warnings |
| Offline Support | Cache recipe data, queue readings |
| Large Text | 18px base, readable at arm's length |
| Minimal Typing | Presets, toggles, sliders |
| Gesture Support | Swipe to delete, pull to refresh |

### 9.2 PWA Features

| Feature | Implementation |
|---------|----------------|
| Manifest | Web app manifest for install prompt |
| Service Worker | Offline caching strategy |
| Icons | Multiple sizes for home screen |
| Splash Screen | Branded loading screen |

---

## 10. Print Support

### 10.1 Brew Day Printout

**Layout for printing:**
```
┌─────────────────────────────────────────────────┐
│  BREW DAY SHEET                                 │
│  Recipe: Summer IPA | Batch: B-2026-042        │
│  Date: June 8, 2026 | Brewer: John             │
├─────────────────────────────────────────────────┤
│  TARGET VALUES                                  │
│  OG: 1.065 | FG: 1.012 | ABV: 6.9%           │
│  IBU: 65 | SRM: 8 | Boil: 60 min              │
├─────────────────────────────────────────────────┤
│  INGREDIENTS                                     │
│  Fermentables:                                  │
│  □ 2-Row Pale Malt     5.0kg                   │
│  □ Crystal 40L         0.5kg                   │
│  □ Munich Malt         0.4kg                   │
│  □ Carapils            0.3kg                   │
│  □ Wheat Malt          0.1kg                   │
│                                                 │
│  Hops:                                          │
│  □ Cascade  28g  @ 60 min                      │
│  □ Centennial 14g  @ 15 min                    │
│  □ Cascade  28g  @ 5 min                       │
│  □ Cascade  42g  Dry Hop                       │
│                                                 │
│  Yeast:                                         │
│  □ Safale US-05  1 pack                        │
├─────────────────────────────────────────────────┤
│  MASH SCHEDULE                                  │
│  □ Mash In     67°C   60 min                   │
│  □ Mash Out    76°C   10 min                   │
├─────────────────────────────────────────────────┤
│  BOIL SCHEDULE                                  │
│  □ 60 min - Add Cascade 28g                   │
│  □ 15 min - Add Centennial 14g                │
│  □ 5 min - Add Cascade 28g                    │
│  □ 0 min - End Boil                            │
├─────────────────────────────────────────────────┤
│  BREW LOG                                       │
│  Time: _____ Temp: _____ SG: _____ Notes:_____ │
│  Time: _____ Temp: _____ SG: _____ Notes:_____ │
│  Time: _____ Temp: _____ SG: _____ Notes:_____ │
│  Time: _____ Temp: _____ SG: _____ Notes:_____ │
│  Time: _____ Temp: _____ SG: _____ Notes:_____ │
└─────────────────────────────────────────────────┘
```

---

*Prepared by Spark (CMO & Creative) - New England Sales Team*
