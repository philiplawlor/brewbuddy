# BrewBuddy - Product Requirements Document

**Version:** 0.1.0
**Date:** June 8, 2026
**Status:** Pre-Release

---

## 1. Overview

### 1.1 Vision

BrewBuddy is a modern brewing assistant that combines recipe design, brew session tracking, water chemistry, and inventory management into a single, beautiful application. Built for homebrewers who want professional-grade tools without the complexity.

### 1.2 Target Users

| User Type | Description |
|-----------|-------------|
| **Homebrewer** | Hobbyist brewing 1-50 batches per year |
| **Brew Club Member** | Part of a community sharing recipes and competing |
| **Craft Brewer** | Small commercial operation needing batch tracking |
| **Recipe Designer** | Focus on creating and sharing recipes |

### 1.3 Success Metrics

| Metric | Target |
|--------|--------|
| Active users (6 months) | 1,000+ |
| Brew sessions logged | 10,000+ |
| Recipe imports from competitors | 5,000+ |
| Mobile usage during brew day | 70%+ |
| User retention (30-day) | 40%+ |

---

## 2. Feature Requirements

### 2.1 MVP Features (v0.1)

#### 2.1.1 Recipe Designer

**Priority:** Critical

| Feature | Description |
|---------|-------------|
| Create Recipe | Full recipe creation with name, style, method (All Grain/Partial/Extract/BIAB) |
| Ingredient Management | Add/edit/remove fermentables, hops, yeast, misc ingredients |
| Real-time Calculations | OG, FG, IBU, SRM, ABV update as ingredients change |
| Style Range Indicators | Visual bars showing where recipe falls within BJCP style ranges |
| Recipe Scaling | Scale by batch size, gravity, or efficiency |
| Mash Profile Builder | Step-by-step mash schedule with temperature/time |
| Fermentation Profile | Multi-stage fermentation temperature planning |
| Recipe Notes | Free-text notes for recipe documentation |
| Recipe Folders | Organize recipes into folders/categories |

**BeerXML Fields (Import/Export):**

```xml
<!-- RECIPE Record -->
<NAME>string (required)</NAME>
<VERSION>integer (always 1)</VERSION>
<TYPE>"Extract" | "Partial Mash" | "All Grain"</TYPE>
<STYLE>Style Record (embedded)</STYLE>
<EQUIPMENT>Equipment Record (optional)</EQUIPMENT>
<BREWER>string (required)</BREWER>
<ASST_BREWER>string (optional)</ASST_BREWER>
<BATCH_SIZE>float (liters)</BATCH_SIZE>
<BOIL_SIZE>float (liters)</BOIL_SIZE>
<BOIL_TIME>integer (minutes)</BOIL_TIME>
<EFFICIENCY>float (percent, required for Partial/All Grain)</EFFICIENCY>
<HOPS>HOP Records (zero or more)</HOPS>
<FERMENTABLES>FERMENTABLE Records (zero or more)</FERMENTABLES>
<MISCS>MISC Records (zero or more)</MISCS>
<YEASTS>YEAST Records (zero or more)</YEASTS>
<WATERS>WATER Records (zero or more)</WATERS>
<MASH>Mash Profile (embedded)</MASH>
<NOTES>text (optional)</NOTES>
<TASTE_NOTES>text (optional)</TASTE_NOTES>
<TASTE_RATING>float 0-50 (optional)</TASTE_RATING>
<OG>float (optional)</OG>
<FG>float (optional)</FG>
<FERMENTATION_STAGES>integer (optional)</FERMENTATION_STAGES>
<PRIMARY_AGE>integer (days, optional)</PRIMARY_AGE>
<PRIMARY_TEMP>float (Celsius, optional)</PRIMARY_TEMP>
<SECONDARY_AGE>integer (days, optional)</SECONDARY_AGE>
<SECONDARY_TEMP>float (Celsius, optional)</SECONDARY_TEMP>
<AGE>integer (days, optional)</AGE>
<AGE_TEMP>float (Celsius, optional)</AGE_TEMP>
<DATE>string (optional)</DATE>
<CARBONATION>float (volumes CO2, optional)</CARBONATION>
<FORCED_CARBONATION>boolean (default FALSE)</FORCED_CARBONATION>
<PRIMING_SUGAR_NAME>string (optional)</PRIMING_SUGAR_NAME>
```

```xml
<!-- HOP Record -->
<HOP>
  <NAME>string (required)</NAME>
  <VERSION>integer (always 1)</VERSION>
  <ALPHA>float (percent, required)</ALPHA>
  <AMOUNT>float (kg, required)</AMOUNT>
  <USE>"Boil" | "Dry Hop" | "Mash" | "First Wort" | "Aroma"</USE>
  <TIME>float (minutes, required)</TIME>
  <TYPE>"Bittering" | "Aroma" | "Both" (optional)</TYPE>
  <FORM>"Pellet" | "Plug" | "Leaf" (optional)</FORM>
  <BETA>float (percent, optional)</BETA>
  <ORIGIN>string (optional)</ORIGIN>
  <SUBSTITUTES>string (optional)</SUBSTITUTES>
  <NOTES>text (optional)</NOTES>
</HOP>
```

```xml
<!-- FERMENTABLE Record -->
<FERMENTABLE>
  <NAME>string (required)</NAME>
  <VERSION>integer (always 1)</VERSION>
  <TYPE>"Grain" | "Sugar" | "Extract" | "Dry Extract" | "Adjunct"</TYPE>
  <AMOUNT>float (kg, required)</AMOUNT>
  <YIELD>float (percent, required)</YIELD>
  <COLOR>float (Lovibond, required)</COLOR>
  <ADD_AFTER_BOIL>boolean (default FALSE)</ADD_AFTER_BOIL>
  <ORIGIN>string (optional)</ORIGIN>
  <SUPPLIER>string (optional)</SUPPLIER>
  <COARSE_FINE_DIFF>float (percent, optional)</COARSE_FINE_DIFF>
  <MOISTURE>float (percent, optional)</MOISTURE>
  <DIASTATIC_POWER>float (Lintner, optional)</DIASTATIC_POWER>
  <PROTEIN>float (percent, optional)</PROTEIN>
  <MAX_IN_BATCH>float (percent, optional)</MAX_IN_BATCH>
  <RECOMMEND_MASH>boolean (default FALSE)</RECOMMEND_MASH>
  <NOTES>text (optional)</NOTES>
</FERMENTABLE>
```

```xml
<!-- YEAST Record -->
<YEAST>
  <NAME>string (required)</NAME>
  <VERSION>integer (always 1)</VERSION>
  <TYPE>"Ale" | "Lager" | "Wheat" | "Wine" | "Champagne"</TYPE>
  <FORM>"Liquid" | "Dry" | "Slant" | "Culture"</FORM>
  <AMOUNT>float (liters or kg, required)</AMOUNT>
  <AMOUNT_IS_WEIGHT>boolean (default FALSE)</AMOUNT_IS_WEIGHT>
  <LABORATORY>string (optional)</LABORATORY>
  <PRODUCT_ID>string (optional)</PRODUCT_ID>
  <MIN_TEMPERATURE>float (Celsius, optional)</MIN_TEMPERATURE>
  <MAX_TEMPERATURE>float (Celsius, optional)</MAX_TEMPERATURE>
  <FLOCCULATION>"Low" | "Medium" | "High" | "Very High" (optional)</FLOCCULATION>
  <ATTENUATION>float (percent, optional)</ATTENUATION>
  <BEST_FOR>string (optional)</BEST_FOR>
  <NOTES>text (optional)</NOTES>
</YEAST>
```

```xml
<!-- WATER Record -->
<WATER>
  <NAME>string (required)</NAME>
  <VERSION>integer (always 1)</VERSION>
  <AMOUNT>float (liters, required)</AMOUNT>
  <CALCIUM>float (ppm, required)</CALCIUM>
  <BICARBONATE>float (ppm, required)</BICARBONATE>
  <SULFATE>float (ppm, required)</SULFATE>
  <CHLORIDE>float (ppm, required)</CHLORIDE>
  <SODIUM>float (ppm, required)</SODIUM>
  <MAGNESIUM>float (ppm, required)</MAGNESIUM>
  <PH>float (optional)</PH>
  <NOTES>text (optional)</NOTES>
</WATER>
```

```xml
<!-- MASH Profile -->
<MASH>
  <NAME>string (required)</NAME>
  <VERSION>integer (always 1)</VERSION>
  <GRAIN_TEMP>float (Celsius, required)</GRAIN_TEMP>
  <MASH_STEPS>
    <MASH_STEP>
      <NAME>string (required)</NAME>
      <VERSION>integer (always 1)</VERSION>
      <TYPE>"Infusion" | "Temperature" | "Decoction"</TYPE>
      <INFUSE_AMOUNT>float (liters, conditional)</INFUSE_AMOUNT>
      <STEP_TEMP>float (Celsius, required)</STEP_TEMP>
      <STEP_TIME>float (minutes, required)</STEP_TIME>
      <RAMP_TIME>float (minutes, optional)</RAMP_TIME>
      <END_TEMP>float (Celsius, optional)</END_TEMP>
    </MASH_STEP>
  </MASH_STEPS>
  <TUN_TEMP>float (Celsius, optional)</TUN_TEMP>
  <SPARGE_TEMP>float (Celsius, optional)</SPARGE_TEMP>
  <PH>float (optional)</PH>
</MASH>
```

#### 2.1.2 Brew Day Tracker

**Priority:** Critical

| Feature | Description |
|---------|-------------|
| Step-by-Step Timer | Guided progression through brew day events |
| Stage Navigation | Mash → Boil → Whirlpool → Cool & Transfer |
| Countdown Timers | Per-step countdown with remaining time |
| Audio Alerts | Sound notification when action required |
| Push Notifications | Background notifications for step changes |
| Event Logging | Timestamped log of all brew day events |
| Manual Confirmations | Pause timer until user confirms step complete |
| Quick Glance | Large text visible at arm's length |

**Brew Day Event Types:**

| Event | Description |
|-------|-------------|
| `mash_in` | Begin mash with strike water |
| `mash_step` | Temperature step change |
| `mash_out` | Begin mash out |
| `vorlauf` | Begin vorlauf recirculation |
| `sparge` | Begin sparge |
| `boil_start` | Begin boil timer |
| `hop_addition` | Add hops at specified time |
| `whirlpool` | Begin whirlpool |
| `flameout` | Kill heat |
| `chill` | Begin chilling |
| `pitch_yeast` | Pitch yeast |
| `transfer` | Transfer to fermenter |

#### 2.1.3 Fermentation Tracking

**Priority:** High

| Feature | Description |
|---------|-------------|
| Fermentation Stages | Primary, Secondary, Tertiary |
| Daily Readings | Gravity, temperature, pH logging |
| Interactive Charts | Visual fermentation curves |
| Device Integration | Tilt, iSpindel, Plaato auto-logging |
| Temperature Alerts | Out-of-range temperature warnings |

#### 2.1.4 Water Chemistry

**Priority:** High

| Feature | Description |
|---------|-------------|
| Water Profiles | Save source water analysis results |
| Target Profiles | BJCP-recommended water profiles by style |
| Additive Calculator | Gypsum, CaCl2, Epsom Salt, etc. |
| pH Calculator | Mash pH prediction and adjustment |
| Treatment Logging | Track what was added per batch |

**Water Parameters Tracked:**

| Parameter | Unit | Range |
|-----------|------|-------|
| Calcium (Ca) | ppm | 0-500 |
| Magnesium (Mg) | ppm | 0-200 |
| Sodium (Na) | ppm | 0-200 |
| Sulfate (SO4) | ppm | 0-500 |
| Chloride (Cl) | ppm | 0-250 |
| Bicarbonate (HCO3) | ppm | 0-500 |
| pH | - | 0-14 |

**Additive Types:**

| Additive | Formula | Increases |
|----------|---------|-----------|
| Gypsum | CaSO4 | Ca, SO4 |
| Calcium Chloride | CaCl2 | Ca, Cl |
| Epsom Salt | MgSO4 | Mg, SO4 |
| Baking Soda | NaHCO3 | Na, Alkalinity |
| Table Salt | NaCl | Na |
| Chalk | CaCO3 | Ca, Alkalinity |
| Campden Tablet | K2S2O5 | Chlorine removal |
| Lactic Acid | C3H6O3 | pH reduction |
| Phosphoric Acid | H3PO4 | pH reduction |

#### 2.1.5 Inventory Management

**Priority:** High

| Feature | Description |
|---------|-------------|
| Ingredient Tracking | Grains, hops, yeast, chemicals, adjuncts |
| Quantity Management | On-hand, reserved, units |
| Cost Tracking | Purchase price, cost per batch |
| Storage Locations | Freezer, fridge, shelf |
| Expiration Tracking | Alert on expired ingredients |
| Low Stock Alerts | Configurable thresholds |
| Supplier Management | Vendor info, shipping costs |

#### 2.1.6 Shopping Lists

**Priority:** Medium

| Feature | Description |
|---------|-------------|
| Auto-Populate | Generate from recipe ingredients |
| Inventory Check | Subtract on-hand quantities |
| Purchase Tracking | Mark items purchased |
| Cost Estimation | Expected total cost |
| Supplier Links | Direct links to purchase online |

#### 2.1.7 User & Permissions

**Priority:** High

| Feature | Description |
|---------|-------------|
| User Profiles | Username, email, avatar, brew level |
| Brew Clubs | Create/join brewing communities |
| Role-Based Access | Owner, Admin, Member, Guest |
| Recipe Sharing | Public/private recipes |
| Club Permissions | Configurable per-role access |

**Permission Matrix:**

| Permission | Owner | Admin | Member | Guest |
|------------|-------|-------|--------|-------|
| Create Recipe | Yes | Yes | Yes | No |
| Edit Own Recipe | Yes | Yes | Yes | No |
| Edit Any Recipe | Yes | Yes | No | No |
| Delete Recipe | Yes | Yes | No | No |
| View Brew Sessions | Yes | Yes | Yes | No |
| Create Brew Sessions | Yes | Yes | Yes | No |
| Manage Inventory | Yes | Yes | No | No |
| Manage Members | Yes | Yes | No | No |
| View Reports | Yes | Yes | Yes | No |
| Export Data | Yes | Yes | No | No |

#### 2.1.8 Recipe Versioning

**Priority:** Medium

| Feature | Description |
|---------|-------------|
| Version Snapshots | Full recipe state at each version |
| Change Summary | What changed and why |
| Version Comparison | Diff between any two versions |
| Rollback | Restore previous version |
| Batch Linking | Link sessions to recipe versions |

#### 2.1.9 Device Integration

**Priority:** High

| Device | Connection | Data |
|--------|------------|------|
| Tilt Hydrometer | Bluetooth → Gateway | Gravity, Temperature |
| iSpindel | WiFi | Gravity, Temperature |
| Plaato Airlock | WiFi | Airflow, Gravity estimate |
| Plaato Keg | WiFi | Volume, Temperature |
| Brewfather Temp | Bluetooth | Temperature |

---

### 2.2 v2 Features (Planned)

| Feature | Description |
|---------|-------------|
| AI Recipe Suggestions | Context-aware recipe recommendations |
| Competition Management | BJCP-style competition hosting |
| Advanced Analytics | Fermentation curves, efficiency trends |
| Yeast Propagation | Generation tracking, cell counting |
| Recipe Forking | Branch and modify community recipes |

### 2.3 v3 Features (Planned)

| Feature | Description |
|---------|-------------|
| Professional Brewer | Multi-location, production scheduling |
| POS Integration | Sales tracking for taproom |
| QR Code Batches | Scannable batch identification |
| API Access | Third-party integrations |
| Webhooks | Event-driven notifications |

---

## 3. Architecture

### 3.1 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTS                            │
├─────────────────────────────────────────────────────────┤
│  Web Browser (React)  │  Mobile (PWA)  │  Device Apps   │
└──────────┬────────────┴───────┬────────┴───────┬────────┘
           │                    │                │
           ▼                    ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                   API GATEWAY                           │
│              Express.js + Rate Limiting                  │
└──────────┬──────────────────────────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌────────┐  ┌────────────────┐
│ Auth   │  │   REST API     │
│ JWT    │  │   Controllers  │
└────────┘  └───────┬────────┘
                    │
           ┌────────┴────────┐
           │                 │
           ▼                 ▼
    ┌───────────┐    ┌───────────┐
    │  MongoDB  │    │  Device   │
    │  8.0      │    │  Gateway  │
    └───────────┘    └───────────┘
```

### 3.2 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React 18 + Vite + TypeScript | Fast builds, type safety, modern tooling |
| Backend | Node.js + Express + TypeScript | JavaScript consistency, large ecosystem |
| Database | MongoDB 8.0 | Schema flexibility, JSON-native, free |
| Auth | JWT | Stateless, scalable |
| Container | Docker + Compose | Consistent environments |
| Build | Docker Buildx | Multi-architecture support |

### 3.3 API Design

RESTful API with standard HTTP methods:

| Method | Pattern | Description |
|--------|---------|-------------|
| `GET` | `/api/{resource}` | List resources |
| `POST` | `/api/{resource}` | Create resource |
| `GET` | `/api/{resource}/:id` | Get single resource |
| `PUT` | `/api/{resource}/:id` | Update resource |
| `DELETE` | `/api/{resource}/:id` | Delete resource |
| `POST` | `/api/{resource}/import` | Import data |
| `GET` | `/api/{resource}/:id/export` | Export data |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Metric | Target |
|--------|--------|
| API Response Time | < 200ms (p95) |
| Page Load Time | < 2s (first contentful paint) |
| Time to Interactive | < 3s |
| Database Query Time | < 50ms (p95) |

### 4.2 Scalability

| Dimension | Target |
|-----------|--------|
| Concurrent Users | 100+ per instance |
| Database Size | 100K+ recipes |
| Brew Sessions | 1M+ total |
| File Storage | 10GB+ recipe exports |

### 4.3 Reliability

| Metric | Target |
|--------|--------|
| Uptime | 99.5% |
| Data Durability | 99.999% (MongoDB replica set) |
| Backup Frequency | Daily automated |
| Recovery Time | < 4 hours |

### 4.4 Security

| Requirement | Implementation |
|-------------|----------------|
| Authentication | JWT with secure HTTP-only cookies |
| Password Hashing | bcrypt with salt rounds ≥ 12 |
| Input Validation | express-validator on all endpoints |
| Rate Limiting | 100 requests/15 min per IP |
| CORS | Configurable origins |
| Environment Variables | Never committed to git |

### 4.5 Mobile Requirements

| Requirement | Specification |
|-------------|---------------|
| Touch Targets | ≥ 48dp (44pt iOS) |
| Viewport | Responsive, 320px - 1920px |
| Offline Support | Full functionality without network |
| Background Sync | Auto-sync when reconnected |
| Screen Wake | Lock screen during brew session |
| Push Notifications | Step alerts, temperature warnings |
| Dark Mode | System preference + manual toggle |
| Text Size | Readable at arm's length |

### 4.6 Accessibility

| Standard | Target |
|----------|--------|
| WCAG | 2.1 AA compliance |
| Keyboard Navigation | Full support |
| Screen Reader | ARIA labels on all interactive elements |
| Color Contrast | ≥ 4.5:1 ratio |
| Focus Indicators | Visible on all focusable elements |

---

## 5. Data Model Overview

See [PRD_SCHEMA.md](PRD_SCHEMA.md) for complete MongoDB schema definitions.

### 5.1 Core Collections

| Collection | Purpose |
|------------|---------|
| `users` | User accounts and profiles |
| `clubs` | Brew club definitions |
| `memberships` | Club membership links |
| `recipes` | Recipe definitions |
| `recipe_versions` | Version snapshots |
| `recipe_ingredients` | Ingredient links |
| `brew_sessions` | Brew day records |
| `session_events` | Timestamped brew day events |
| `temperature_logs` | Environmental readings |
| `fermentations` | Fermentation stage records |
| `fermentation_readings` | Periodic gravity/temp readings |
| `water_profiles` | Water chemistry profiles |
| `water_treatments` | Per-batch water adjustments |
| `inventory_items` | Ingredient inventory |
| `shopping_lists` | Shopping list containers |
| `shopping_items` | Individual shopping items |
| `equipment` | Brewing equipment |
| `devices` | IoT device registrations |

---

## 6. Competitive Analysis

### 6.1 Feature Comparison

| Feature | BrewBuddy | Brewfather | BeerSmith | BrewTarget |
|---------|-----------|------------|-----------|------------|
| Recipe Designer | Yes | Yes | Yes | Yes |
| Real-time Calc | Yes | Yes | Yes | Yes |
| Brew Day Timer | Yes | Yes | Yes | Yes |
| Fermentation Logging | Yes | Yes | Limited | Limited |
| Device Integration | Yes | Yes | No | No |
| Water Chemistry | Yes | Yes | Yes | No |
| Inventory Mgmt | Yes | Yes | Yes | No |
| Shopping Lists | Yes | Limited | No | No |
| Brew Clubs | Yes | Limited | No | No |
| Recipe Versioning | Yes | Yes | Limited | No |
| BeerXML Import | Yes | Yes | Native | Yes |
| BeerJSON Import | Yes | No | No | Yes |
| Offline Support | Yes | Yes | Yes | Limited |
| Open Source | No | No | No | Yes |
| Mobile App | PWA | Native | Native | No |

### 6.2 Differentiators

1. **BeerJSON Support** — Only BrewBuddy and BrewTarget support the modern standard
2. **Comprehensive Shopping Lists** — Auto-populate from recipes with inventory integration
3. **Brew Club Features** — Role-based permissions, competition management
4. **Modern UI** — Match or exceed Brewfather's interface quality
5. **Open Pricing** — Generous free tier, reasonable premium

---

## 7. Success Criteria

### 7.1 MVP Launch Criteria

| Criterion | Target |
|-----------|--------|
| All MVP features functional | 100% |
| BeerXML import/export | Full support |
| BeerJSON import/export | Full support |
| Brew day timer | Background notifications working |
| Mobile responsive | 320px - 1920px |
| Docker deployment | One-command startup |
| Documentation | README + API docs complete |

### 7.2 Post-Launch Metrics

| Metric | 30-Day Target |
|--------|---------------|
| User registrations | 500+ |
| Recipes created | 2,000+ |
| Brew sessions logged | 500+ |
| BeerXML imports | 1,000+ |
| Active daily users | 50+ |

---

## Appendix A: BeerXML Complete Field Reference

See section 2.1.1 for full field definitions per record type.

**Units (Fixed in BeerXML 1.0):**

| Measurement | Unit |
|-------------|------|
| Weight | Kilograms (kg) |
| Volume | Liters (L) |
| Temperature | Celsius |
| Time | Minutes |
| Specific Gravity | Relative to water (1.000+) |
| Pressure | Kilopascals (kPa) |
| Color | Lovibond (SRM for extracts) |

---

## Appendix B: Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-06-08 | Initial PRD creation |

---

*Prepared by the New England Sales Team*
*Document Owner: Percy (CPO) & Sync (PM)*
