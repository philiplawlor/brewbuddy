# BrewBuddy - Database Schema

**Version:** 0.1.0
**Database:** MongoDB 8.0 Community Edition

---

## Overview

This document defines the complete MongoDB schema for BrewBuddy. All collections use MongoDB's flexible document model with embedded references where appropriate.

---

## 1. Users & Authentication

### 1.1 users Collection

```javascript
{
  _id: ObjectId,
  username: String,          // unique, required
  email: String,             // unique, required
  passwordHash: String,      // bcrypt hash, required
  displayName: String,       // required
  avatarUrl: String,         // optional
  brewLevel: String,         // enum: "beginner", "intermediate", "advanced", "professional"
  location: String,          // optional
  timezone: String,          // default: "UTC"
  preferredUnit: String,     // enum: "metric", "imperial"
  preferredGravityUnit: String, // enum: "SG", "Brix", "Plato"
  totalBrews: Number,        // default: 0
  lastActive: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ username: 1 }` (unique)
- `{ email: 1 }` (unique)

---

## 2. Brew Clubs & Permissions

### 2.1 clubs Collection

```javascript
{
  _id: ObjectId,
  name: String,              // unique, required
  clubType: String,          // enum: "homebrew_club", "professional_brewery", "brewing_guild", "competition_club"
  description: String,       // optional
  location: String,          // optional
  website: String,           // optional
  logoUrl: String,           // optional
  foundedDate: Date,         // optional
  maxMembers: Number,        // optional
  isPublic: Boolean,         // default: true
  createdBy: ObjectId,       // ref: users
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 memberships Collection

```javascript
{
  _id: ObjectId,
  clubId: ObjectId,          // ref: clubs, required
  userId: ObjectId,          // ref: users, required
  role: String,              // enum: "owner", "admin", "member", "guest"
  status: String,            // enum: "active", "pending", "suspended", "banned"
  joinedDate: Date,
  duesPaid: Boolean,         // default: false
  duesExpiry: Date,          // optional
  invitedBy: ObjectId,       // ref: users, optional
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ clubId: 1, userId: 1 }` (unique)
- `{ userId: 1 }`

### 2.3 permissions Collection

```javascript
{
  _id: ObjectId,
  clubId: ObjectId,          // ref: clubs, required
  role: String,              // enum: "owner", "admin", "member", "guest"
  permissions: {
    createRecipe: Boolean,   // default: true
    editOwnRecipe: Boolean,  // default: true
    editAnyRecipe: Boolean,  // default: false
    deleteRecipe: Boolean,   // default: false
    viewBrewSessions: Boolean, // default: true
    createBrewSessions: Boolean, // default: true
    manageInventory: Boolean, // default: false
    manageMembers: Boolean,  // default: false
    approveJoinRequests: Boolean, // default: false
    createEvents: Boolean,   // default: true
    manageWaterProfiles: Boolean, // default: false
    viewReports: Boolean,    // default: true
    exportData: Boolean,     // default: false
    shareRecipesPublic: Boolean, // default: true
    enterCompetitions: Boolean, // default: true
    judgeCompetitions: Boolean // default: false
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 3. Recipes

### 3.1 recipes Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // ref: users, required
  recipeName: String,        // required
  style: String,             // BJCP style name
  styleCode: String,         // BJCP code (e.g., "18A")
  version: Number,           // version number, default: 1
  parentRecipeId: ObjectId,  // ref: recipes, optional (for forks)
  isTemplate: Boolean,       // default: false
  isPublic: Boolean,         // default: false
  isArchived: Boolean,       // default: false
  method: String,            // enum: "all_grain", "partial_mash", "extract", "biab"

  // Batch Info
  batchSize: Number,         // liters
  batchSizeUnit: String,     // enum: "L", "gal", "bbl"
  boilTimeMinutes: Number,
  efficiency: Number,        // percent (0-100)

  // Calculated Stats (from ingredients)
  estimatedOg: Number,
  estimatedFg: Number,
  estimatedAbv: Number,
  estimatedIbu: Number,
  estimatedSrm: Number,
  estimatedCalories: Number,

  // Actual Results (from brew sessions)
  actualOg: Number,
  actualFg: Number,
  actualAbv: Number,
  actualIbu: Number,
  actualSrm: Number,

  // Notes
  notes: String,
  tasteNotes: String,
  tasteRating: Number,       // 0-50

  // Mash Profile
  mashProfile: {
    name: String,
    grainTemp: Number,       // Celsius
    tunTemp: Number,
    spargeTemp: Number,
    ph: Number,
    steps: [{
      name: String,
      type: String,          // enum: "infusion", "temperature", "decoction"
      infuseAmount: Number,  // liters
      stepTemp: Number,      // Celsius
      stepTime: Number,      // minutes
      rampTime: Number,      // minutes
      endTemp: Number
    }]
  },

  // Fermentation Profile
  fermentationProfile: {
    name: String,
    stages: [{
      name: String,
      targetTemp: Number,    // Celsius
      durationDays: Number,
      notes: String
    }]
  },

  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ userId: 1 }`
- `{ style: 1 }`
- `{ isPublic: 1 }`
- `{ createdAt: -1 }`

### 3.2 recipe_ingredients Collection

```javascript
{
  _id: ObjectId,
  recipeId: ObjectId,        // ref: recipes, required
  versionId: ObjectId,       // ref: recipe_versions, optional
  ingredientType: String,    // enum: "grain", "hops", "yeast", "adjunct", "chemical"
  order: Number,             // display order

  // Grain/Fermentable Fields
  ingredientId: ObjectId,    // ref: inventory_items, optional
  name: String,
  category: String,          // enum: "base_malt", "specialty_malt", "roasted_malt", "caramel_malt", "smoked_malt"
  grainWeight: Number,
  grainWeightUnit: String,   // enum: "lb", "kg", "g", "oz"
  grainPercent: Number,      // percent of grain bill
  lovibond: Number,
  potentialExtract: Number,
  yieldPercent: Number,
  supplier: String,

  // Hops Fields
  hopsWeight: Number,
  hopsWeightUnit: String,    // enum: "g", "oz", "lb"
  hopAdditionTime: String,   // enum: "60 min", "30 min", "15 min", "5 min", "0 min", "whirlpool", "dry hop"
  hopAlphaAcid: Number,      // percent
  hopBoilMinutes: Number,
  hopForm: String,           // enum: "pellet", "whole_leaf", "extract", "cryo"

  // Yeast Fields
  yeastPackageCount: Number,
  yeastStarterSizeMl: Number,
  yeastCellCount: Number,    // billions
  yeastType: String,
  yeastForm: String,
  strainId: String,
  laboratory: String,

  // Misc/Adjunct Fields
  additiveAmount: Number,
  additiveUnit: String,
  miscUse: String,           // enum: "boil", "mash", "primary", "secondary", "bottling"

  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 3.3 recipe_versions Collection

```javascript
{
  _id: ObjectId,
  recipeId: ObjectId,        // ref: recipes, required
  versionNumber: Number,     // required
  changeSummary: String,     // what changed
  changeReason: String,      // why it changed
  parentVersionId: ObjectId, // ref: recipe_versions, optional
  snapshotDate: Date,

  // Full Recipe Snapshot
  recipeSnapshot: Object,    // complete recipe data at this version

  // Comparison Data
  ogChange: Number,
  fgChange: Number,
  ibuChange: Number,
  srmChange: Number,

  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 3.4 recipe_sharing Collection

```javascript
{
  _id: ObjectId,
  originalRecipeId: ObjectId, // ref: recipes, required
  sharedRecipeId: ObjectId,   // ref: recipes, required (the copy)
  sharedBy: ObjectId,        // ref: users, required
  sharedWithUserId: ObjectId, // ref: users, optional
  sharedWithClubId: ObjectId, // ref: clubs, optional
  shareType: String,         // enum: "public", "club", "private"
  shareUrl: String,          // unique public URL
  permissions: String,       // enum: "view", "copy", "edit"
  createdAt: Date
}
```

---

## 4. Brew Sessions

### 4.1 brew_sessions Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // ref: users, required
  recipeId: ObjectId,        // ref: recipes, required
  recipeVersionId: ObjectId, // ref: recipe_versions, optional
  batchNumber: String,       // e.g., "B-2026-042"
  sessionName: String,       // descriptive name
  brewDate: Date,
  status: String,            // enum: "planned", "in_progress", "fermenting", "conditioning", "bottled", "consumed"

  // Batch Info
  batchSize: Number,
  batchSizeUnit: String,     // enum: "L", "gal", "bbl"
  method: String,            // enum: "all_grain", "partial_mash", "extract", "biab"

  // Actual Results
  actualOg: Number,
  actualFg: Number,
  actualAbv: Number,
  actualIbu: Number,
  actualSrm: Number,

  // Timing
  brewDurationMinutes: Number,
  fermentationDays: Number,
  conditioningDays: Number,

  // Environment
  ambientTemperature: Number,
  humidity: Number,

  // Cost
  totalCost: Number,
  costPerLiter: Number,

  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ userId: 1 }`
- `{ recipeId: 1 }`
- `{ status: 1 }`
- `{ brewDate: -1 }`

### 4.2 session_events Collection

```javascript
{
  _id: ObjectId,
  sessionId: ObjectId,       // ref: brew_sessions, required
  eventType: String,         // enum: "mash_in", "mash_step", "mash_out", "vorlauf", "sparge", "boil_start", "hop_addition", "whirlpool", "flameout", "chill", "pitch_yeast", "transfer"
  timestamp: Date,
  temperature: Number,       // at time of event
  gravityReading: Number,    // if taken
  notes: String,
  durationMinutes: Number,   // for timed events

  // Hop Addition Specific
  hopName: String,
  hopWeight: Number,
  hopWeightUnit: String,
  hopAlphaAcid: Number,
  hopBoilMinutes: Number,

  // Mash Step Specific
  mashStepName: String,
  targetTemp: Number,
  actualTemp: Number,

  createdAt: Date
}
```

### 4.3 temperature_logs Collection

```javascript
{
  _id: ObjectId,
  sessionId: ObjectId,       // ref: brew_sessions, required
  timestamp: Date,
  sensorType: String,        // enum: "boil_kettle", "mash_tun", "fermentation", "ambient", "chiller_output"
  temperature: Number,
  temperatureUnit: String,   // enum: "C", "F"
  humidity: Number,          // percent
  pressure: Number,          // PSI
  phReading: Number,
  notes: String,
  createdAt: Date
}
```

**Indexes:**
- `{ sessionId: 1, timestamp: 1 }`

---

## 5. Fermentation

### 5.1 fermentations Collection

```javascript
{
  _id: ObjectId,
  sessionId: ObjectId,       // ref: brew_sessions, required
  vesselId: ObjectId,        // ref: equipment, optional
  vesselName: String,
  startDate: Date,
  endDate: Date,
  targetTemp: Number,        // Celsius
  actualTemp: Number,
  temperatureUnit: String,
  ambientTemp: Number,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 5.2 fermentation_readings Collection

```javascript
{
  _id: ObjectId,
  fermentationId: ObjectId,  // ref: fermentations, required
  timestamp: Date,
  gravity: Number,
  gravityUnit: String,       // enum: "SG", "Brix", "Plato"
  temperature: Number,
  temperatureUnit: String,
  ph: Number,                // optional
  notes: String,
  source: String,            // enum: "manual", "tilt", "ispindel", "plaato"
  createdAt: Date
}
```

**Indexes:**
- `{ fermentationId: 1, timestamp: 1 }`

### 5.3 devices Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // ref: users, required
  deviceType: String,        // enum: "tilt", "ispindel", "plaato_airlock", "plaato_keg", "brewfather_temp"
  deviceName: String,
  macAddress: String,
  firmwareVersion: String,
  linkedSessionId: ObjectId, // ref: brew_sessions, optional
  calibrationFactor: Number,
  isActive: Boolean,         // default: true
  lastReading: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 6. Water Chemistry

### 6.1 water_profiles Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // ref: users, required
  profileName: String,       // e.g., "My City Water", "Well Water"
  waterSource: String,       // enum: "municipal", "well", "spring", "ro_distilled", "bottled"
  isDefault: Boolean,        // default: false

  // Ion Concentrations (PPM)
  calciumCa: Number,
  magnesiumMg: Number,
  sodiumNa: Number,
  sulfateSo4: Number,
  chlorideCl: Number,
  bicarbonateHco3: Number,

  // Derived Values
  totalHardness: Number,     // as CaCO3
  alkalinity: Number,        // as CaCO3
  residualAlkalinity: Number,
  tds: Number,               // Total Dissolved Solids

  // pH
  sourcePh: Number,

  // Optional Measurements
  iron: Number,
  manganese: Number,
  freeChlorine: Number,
  chloramine: Number,
  dissolvedOxygen: Number,

  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ userId: 1 }`

### 6.2 water_treatments Collection

```javascript
{
  _id: ObjectId,
  sessionId: ObjectId,       // ref: brew_sessions, required
  profileId: ObjectId,       // ref: water_profiles, required

  // Salt Additions (grams)
  gypsumCaSo4Grams: Number,
  calciumChlorideCaCl2Grams: Number,
  epsomSaltMgSo4Grams: Number,
  bakingSodaNaHco3Grams: Number,
  tableSaltNaClGrams: Number,
  chalkCaCo3Grams: Number,

  // Acid Additions
  lacticAcidMl: Number,
  phosphoricAcidMl: Number,
  citricAcidGrams: Number,

  // Other Treatments
  campdenTabletCount: Number,
  campdenWeightGrams: Number,

  // pH Results
  targetMashPh: Number,
  actualMashPh: Number,
  mashPhMeasuredAt: Date,

  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 6.3 style_water_targets Collection (Reference Data)

```javascript
{
  _id: ObjectId,
  styleName: String,         // e.g., "American IPA"
  styleCode: String,         // e.g., "21A"
  targetPhMin: Number,
  targetPhMax: Number,
  caMin: Number,
  caMax: Number,
  mgMin: Number,
  mgMax: Number,
  naMin: Number,
  naMax: Number,
  so4Min: Number,
  so4Max: Number,
  clMin: Number,
  clMax: Number,
  hco3Min: Number,
  hco3Max: Number,
  so4ClRatioMin: Number,     // e.g., IPA = 3:1
  so4ClRatioMax: Number,
  notes: String,             // "Hops-forward", "Malty", "Balanced"
  createdAt: Date,
  updatedAt: Date
}
```

---

## 7. Inventory

### 7.1 inventory_items Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // ref: users, required
  itemType: String,          // enum: "grain", "malt_extract", "hops", "yeast", "adjunct", "chemical", "packaging"

  // Common Fields
  name: String,
  category: String,
  supplier: String,
  productCode: String,       // SKU

  // Grain/Malt Fields
  lovibond: Number,
  potentialExtract: Number,
  extractFineGrind: Number,
  extractCoarseGrind: Number,
  moisturePct: Number,
  diastaticPower: Number,    // degreesLintner
  proteinPct: Number,
  kolbachIndex: Number,

  // Hops Fields
  alphaAcidPct: Number,
  betaAcidPct: Number,
  cohumulonePct: Number,
  hopType: String,           // enum: "pellet", "whole_leaf", "extract", "cryo", "fresh"
  harvestYear: Number,
  origin: String,

  // Yeast Fields
  yeastType: String,         // enum: "ale", "lager", "belgian", "wild", "champagne"
  yeastForm: String,         // enum: "liquid", "dry", "slurry"
  strainId: String,
  attenuationMin: Number,
  attenuationMax: Number,
  tempMin: Number,
  tempMax: Number,
  flocculation: String,      // enum: "low", "medium", "high", "very_high"
  alcoholTolerance: Number,

  // Chemical Fields
  chemicalType: String,      // enum: "fining", "stabilizer", "acid", "salt", "sanitizer"
  concentration: Number,

  // Inventory Quantities
  quantityOnHand: Number,
  quantityUnit: String,      // enum: "lb", "kg", "g", "oz", "pack", "vial", "vial_count"
  quantityReserved: Number,  // reserved for planned batches

  // Cost Tracking
  costPerUnit: Number,
  costCurrency: String,      // default: "USD"

  // Storage
  storageLocation: String,   // enum: "freezer", "fridge", "shelf", "cold_room"
  storageTemperature: Number,

  // Dates
  purchaseDate: Date,
  expirationDate: Date,
  lotNumber: String,

  // Metadata
  notes: String,
  imageUrl: String,
  barcode: String,

  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ userId: 1 }`
- `{ itemType: 1 }`
- `{ name: "text" }` (text search)

---

## 8. Shopping Lists

### 8.1 shopping_lists Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // ref: users, required
  listName: String,
  status: String,            // enum: "draft", "active", "purchased", "archived"
  linkedRecipeId: ObjectId,  // ref: recipes, optional
  linkedSessionId: ObjectId, // ref: brew_sessions, optional
  totalEstimatedCost: Number,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 8.2 shopping_items Collection

```javascript
{
  _id: ObjectId,
  shoppingListId: ObjectId,  // ref: shopping_lists, required
  ingredientId: ObjectId,    // ref: inventory_items, optional
  ingredientName: String,
  ingredientType: String,    // enum: "grain", "hops", "yeast", "adjunct", "chemical"
  quantityNeeded: Number,
  quantityUnit: String,
  quantityOnHand: Number,    // current inventory
  quantityToPurchase: Number, // calculated
  supplierPreference: String,
  preferredRetailer: String,
  estimatedCost: Number,
  actualCost: Number,
  linkUrl: String,           // product link
  purchased: Boolean,        // default: false
  purchaseDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 9. Equipment

### 9.1 equipment Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // ref: users, required
  equipmentType: String,     // enum: "kettle", "mash_tun", "fermenter", "chiller", "keg", "bottle", "kegerator"
  name: String,
  manufacturer: String,
  model: String,
  capacity: Number,
  capacityUnit: String,      // enum: "L", "gal", "bbl"
  purchaseDate: Date,
  purchasePrice: Number,
  warrantyExpiry: Date,
  condition: String,         // enum: "new", "good", "fair", "needs_repair", "decommissioned"
  lastMaintenance: Date,
  maintenanceNotes: String,
  isActive: Boolean,         // default: true
  notes: String,

  // Fermentation Vessel Specific
  vesselType: String,        // enum: "carboy", "bucket", "conical", "keg", "flex"
  material: String,          // enum: "glass", "plastic", "stainless_steel", "stainless_steel_flex"
  isCurrentlyOccupied: Boolean,
  currentBatchId: ObjectId,  // ref: brew_sessions, optional
  lastCleaned: Date,
  lastSanitized: Date,

  createdAt: Date,
  updatedAt: Date
}
```

---

## 10. Suppliers

### 10.1 suppliers Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // ref: users, required
  name: String,              // e.g., "MoreBeer", "Northern Brewer"
  website: String,
  phone: String,
  email: String,
  address: String,
  shippingCostStandard: Number,
  shippingCostExpedited: Number,
  freeShippingThreshold: Number,
  loyaltyProgram: Boolean,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 11. Competitions (v2)

### 11.1 competitions Collection

```javascript
{
  _id: ObjectId,
  clubId: ObjectId,          // ref: clubs, required
  name: String,
  competitionDate: Date,
  styleGuidelines: String,   // enum: "BJCP", "BA", "custom"
  status: String,            // enum: "planning", "accepting_entries", "judging", "complete"
  maxEntries: Number,
  entryFee: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 11.2 competition_entries Collection

```javascript
{
  _id: ObjectId,
  competitionId: ObjectId,   // ref: competitions, required
  userId: ObjectId,          // ref: users, required
  sessionId: ObjectId,       // ref: brew_sessions, required
  entryNumber: Number,
  styleCategory: String,     // BJCP code
  styleName: String,
  beerName: String,
  abv: Number,
  ibu: Number,
  srm: Number,
  submitted: Boolean,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 11.3 scorecards Collection

```javascript
{
  _id: ObjectId,
  entryId: ObjectId,         // ref: competition_entries, required
  judgeId: ObjectId,         // ref: users, required
  aromaScore: Number,        // 0-12
  appearanceScore: Number,   // 0-3
  flavorScore: Number,       // 0-20
  mouthfeelScore: Number,    // 0-5
  overallScore: Number,      // 0-10
  totalScore: Number,        // 0-50
  comments: String,
  isFirstPlace: Boolean,
  isSecondPlace: Boolean,
  isThirdPlace: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 12. Analytics

### 12.1 batch_history Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // ref: users, required
  recipeId: ObjectId,        // ref: recipes, required
  sessionIds: [ObjectId],    // ref: brew_sessions
  iterationCount: Number,
  bestSessionId: ObjectId,   // ref: brew_sessions
  avgOg: Number,
  avgFg: Number,
  avgAbv: Number,
  avgRating: Number,
  avgBrewTimeMinutes: Number,
  avgFermentationDays: Number,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 12.2 tasting_notes Collection

```javascript
{
  _id: ObjectId,
  sessionId: ObjectId,       // ref: brew_sessions, required
  userId: ObjectId,          // ref: users, required
  tastingDate: Date,

  // Sensory Scores
  appearanceScore: Number,   // 1-5
  aromaScore: Number,        // 1-10
  flavorScore: Number,       // 1-10
  mouthfeelScore: Number,    // 1-5
  overallScore: Number,      // 1-10

  // Descriptive Tags
  appearanceTags: [String],  // "clear", "hazy", "ruby", "golden", "white head"
  aromaTags: [String],       // "citrus", "pine", "caramel", "bready", "floral"
  flavorTags: [String],      // "bitter", "malty", "dry", "sweet", "roasty"
  mouthfeelTags: [String],   // "smooth", "crisp", "creamy", "astringent"

  // Free Text
  appearanceNotes: String,
  aromaNotes: String,
  flavorNotes: String,
  mouthfeelNotes: String,
  overallNotes: String,

  // Rating
  rating: Number,            // 0-5 stars or 0-100

  // Comparison
  wouldBrewAgain: Boolean,
  wouldChange: String,

  createdAt: Date,
  updatedAt: Date
}
```

---

## 13. Database Relationships

```
users (1) ──── (N) recipes
users (1) ──── (N) brew_sessions
users (1) ──── (N) inventory_items
users (1) ──── (N) water_profiles
users (1) ──── (N) equipment
users (1) ──── (N) suppliers
users (1) ──── (N) devices
users (N) ──── (N) clubs (via memberships)
recipes (1) ──── (N) recipe_ingredients
recipes (1) ──── (N) recipe_versions
recipes (1) ──── (N) brew_sessions
brew_sessions (1) ──── (N) session_events
brew_sessions (1) ──── (N) temperature_logs
brew_sessions (1) ──── (N) fermentations
brew_sessions (1) ──── (N) water_treatments
brew_sessions (1) ──── (N) tasting_notes
fermentations (1) ──── (N) fermentation_readings
shopping_lists (1) ──── (N) shopping_items
clubs (1) ──── (N) memberships
competitions (1) ──── (N) competition_entries
competition_entries (1) ──── (N) scorecards
```

---

## 14. Index Strategy

### 14.1 Common Query Patterns

| Query | Collection | Index |
|-------|------------|-------|
| Get user's recipes | recipes | `{ userId: 1, createdAt: -1 }` |
| Get public recipes | recipes | `{ isPublic: 1, createdAt: -1 }` |
| Get recipe by style | recipes | `{ style: 1 }` |
| Get user's brew sessions | brew_sessions | `{ userId: 1, brewDate: -1 }` |
| Get recipe's brew sessions | brew_sessions | `{ recipeId: 1 }` |
| Get active sessions | brew_sessions | `{ status: 1 }` |
| Get session events | session_events | `{ sessionId: 1, timestamp: 1 }` |
| Get fermentation readings | fermentation_readings | `{ fermentationId: 1, timestamp: 1 }` |
| Get user's inventory | inventory_items | `{ userId: 1, itemType: 1 }` |
| Search inventory | inventory_items | `{ name: "text" }` |
| Get user's water profiles | water_profiles | `{ userId: 1 }` |
| Get club members | memberships | `{ clubId: 1, status: 1 }` |
| Get user's memberships | memberships | `{ userId: 1 }` |

### 14.2 Performance Considerations

- Use `lean()` for read-only queries to reduce memory
- Implement pagination with `skip()` and `limit()` for large result sets
- Use aggregation pipeline for analytics queries
- Consider TTL indexes for temporary data (device readings)

---

*Prepared by Cody (CTO) and Percy (CPO) - New England Sales Team*
