# BrewBuddy - Brewing Calculators

**Version:** 0.1.0
**Date:** June 8, 2026

---

## 1. Overview

BrewBuddy includes 11 essential brewing calculators for MVP, each with full formula documentation. Calculators are accessible from the Calculator Hub or inline within recipes and brew sessions.

---

## 2. Calculator Index

| # | Calculator | Category | Key Formula |
|---|------------|----------|-------------|
| 1 | Priming Sugar | Packaging | Weight = ΔVolumes × Volume × 4.0 |
| 2 | Carbonation (Force) | Packaging | PSI from Temperature and CO2 |
| 3 | Refractometer | Measurement | Brix → SG with alcohol correction |
| 4 | ABV Temperature | Measurement | Hydrometer temperature correction |
| 5 | Pitch Rate | Fermentation | Cells = Volume × Gravity Points × Rate |
| 6 | Yeast Starter | Fermentation | Starter Vol = ΔCells / Growth Factor |
| 7 | Mash Thickness | Mash | Ratio = Water Volume / Grain Weight |
| 8 | Strike Water Temp | Mash | T = f(Target, Grain, Ratio, Tun) |
| 9 | Grain Absorption | Mash | Absorption = Weight × Rate |
| 10 | Water Profile Match | Water | Euclidean distance in ion space |
| 11 | Mash pH | Water | Predicted pH from grain + water |

---

## 3. Calculators - Full Documentation

### 3.1 Priming Sugar Calculator

**Purpose:** Calculate the amount of priming sugar needed for bottle conditioning.

**Formula:**
```
Weight (g) = (Target Volumes CO2 - Residual Volumes CO2) × Batch Volume (L) × 4.0
```

**Residual CO2 by Beer Temperature:**

| Temperature | Residual CO2 (Volumes) |
|-------------|----------------------|
| 0°C (32°F) | 1.5 |
| 2°C (36°F) | 1.4 |
| 4°C (40°F) | 1.3 |
| 6°C (44°F) | 1.2 |
| 8°C (48°F) | 1.1 |
| 10°C (50°F) | 1.0 |
| 12°C (54°F) | 0.9 |
| 14°C (57°F) | 0.8 |
| 16°C (61°F) | 0.7 |
| 18°C (65°F) | 0.6 |
| 20°C (68°F) | 0.5 |

**Sugars Supported:**

| Sugar | Factor | Notes |
|-------|--------|-------|
| Corn Sugar (Dextrose) | 1.0 | Standard reference |
| Table Sugar (Sucrose) | 0.95 | Slightly less CO2 |
| DME (Dry Malt Extract) | 0.70 | Less fermentable |
| Honey | 0.75 | Variable fermentability |
| Maple Syrup | 0.65 | Less fermentable |

**Example:**
```
Given:
- Batch volume: 19 L (5 gal)
- Beer temperature: 18°C
- Target CO2: 2.5 volumes
- Sugar type: Corn sugar

Residual CO2 at 18°C = 0.6 volumes
Weight = (2.5 - 0.6) × 19 × 4.0
Weight = 1.9 × 19 × 4.0
Weight = 144.4 g corn sugar
```

**Inputs:**
- Batch volume (L or gal)
- Beer temperature (°C or °F)
- Target CO2 volumes
- Sugar type

**Output:**
- Weight of sugar in grams and ounces
- Equivalent in other sugar types

---

### 3.2 Carbonation Calculator (Force Carbonation)

**Purpose:** Calculate the regulator PSI setting needed to achieve target carbonation at a given temperature.

**Formula (Carbonation Table Approximation):**
```
PSI = (Target CO2 × 14.696) / (Solubility Coefficient × e^(-0.02 × Temperature))

Where:
- Temperature in °F
- 14.696 = atmospheric pressure in PSI
- Solubility coefficient ≈ 3.0 (varies by temperature)
```

**Simplified Formula:**
```
PSI = Target CO2 × (Temperature + 14.7) / (Temperature + 212)

Where:
- Temperature in °F
- Result in PSI gauge
```

**Carbonation Temperature Table:**

| Temp (°F) | 1.0 Vol | 1.5 Vol | 2.0 Vol | 2.5 Vol | 3.0 Vol |
|-----------|---------|---------|---------|---------|---------|
| 32°F | 5.2 | 7.8 | 10.4 | 13.0 | 15.6 |
| 36°F | 5.8 | 8.7 | 11.6 | 14.5 | 17.4 |
| 40°F | 6.4 | 9.6 | 12.8 | 16.0 | 19.2 |
| 44°F | 7.1 | 10.7 | 14.2 | 17.8 | 21.3 |
| 48°F | 7.8 | 11.7 | 15.6 | 19.5 | 23.4 |
| 50°F | 8.2 | 12.3 | 16.4 | 20.5 | 24.6 |
| 54°F | 9.0 | 13.5 | 18.0 | 22.5 | 27.0 |
| 58°F | 9.9 | 14.9 | 19.8 | 24.8 | 29.7 |
| 62°F | 10.8 | 16.2 | 21.6 | 27.0 | 32.4 |
| 66°F | 11.8 | 17.7 | 23.6 | 29.5 | 35.4 |
| 70°F | 12.9 | 19.4 | 25.8 | 32.3 | 38.7 |

**Example:**
```
Given:
- Target CO2: 2.5 volumes
- Beer temperature: 40°F (4.4°C)

PSI = 2.5 × (40 + 14.7) / (40 + 212)
PSI = 2.5 × 54.7 / 252
PSI = 136.75 / 252
PSI = 0.543 (gauge pressure relative to atmospheric)

Using table lookup: ~16 PSI at 40°F for 2.5 volumes
```

**Inputs:**
- Target CO2 volumes
- Beer temperature (°F or °C)
- Altitude (optional, for pressure correction)

**Output:**
- Regulator PSI setting
- Time to carbonation estimate

---

### 3.3 Refractometer Calculator (Brix to SG)

**Purpose:** Convert Brix readings to Specific Gravity, with correction for alcohol during fermentation.

**Formulas:**

**For Wort (Before Fermentation):**
```
SG = 1.000 + (Brix × 0.004)
```

**For Beer (During/After Fermentation):**
```
OG = (1.000 - 0.0083 × Brix_wort + 0.00392 × Brix_sample)

Where:
- Brix_wort = Brix reading of original wort (or calculate from OG)
- Brix_sample = Current Brix reading
```

**Alternative Formula (Linear Approximation):**
```
SG = 1.000898 + 0.003859 × Brix + 0.0000134 × Brix²
```

**True SG During Fermentation (John Palmer Method):**
```
FG = 1.000 - 0.0085683 × Brix_sample + 0.003638 × Brix_wort

Where:
- Brix_wort = Initial Brix (from OG)
- Brix_sample = Current reading
```

**Brix to SG Reference Table:**

| Brix | SG (Wort) | Brix | SG (Wort) |
|-------|-----------|-------|-----------|
| 1.0 | 1.004 | 14.0 | 1.056 |
| 2.0 | 1.008 | 16.0 | 1.064 |
| 4.0 | 1.016 | 18.0 | 1.072 |
| 6.0 | 1.024 | 20.0 | 1.080 |
| 8.0 | 1.032 | 22.0 | 1.088 |
| 10.0 | 1.040 | 24.0 | 1.096 |
| 12.0 | 1.048 | 26.0 | 1.104 |

**Example:**
```
Given:
- Original Brix (wort): 15.0
- Current Brix (beer): 5.0

OG = 1.000 + (15.0 × 0.004) = 1.060
FG = 1.000 - 0.0085683 × 5.0 + 0.003638 × 15.0
FG = 1.000 - 0.0428 + 0.0546
FG = 1.012

ABV = (OG - FG) × 131.25
ABV = (1.060 - 1.012) × 131.25
ABV = 6.3%
```

**Inputs:**
- Brix reading
- Wort stage: Wort or Beer
- Original Brix (if during fermentation)
- Temperature (optional, for refraction correction)

**Output:**
- Specific Gravity (SG)
- Original Gravity (if during fermentation)
- Final Gravity (if during fermentation)
- ABV estimate

---

### 3.4 ABV Temperature Correction

**Purpose:** Correct hydrometer gravity readings for sample temperature.

**Formula (US Standard):**
```
Corrected SG = Reading + 0.00039 × (Temperature - 60°F)

Where:
- Reading = Measured specific gravity
- Temperature = Sample temperature in °F
- 60°F = Standard calibration temperature
```

**Formula (Metric):**
```
Corrected SG = Reading + 0.00027 × (Temperature - 15.6°C)

Where:
- Temperature in °C
- 15.6°C = Standard calibration temperature (60°F)
```

**Extended Formula (More Accurate):**
```
Corrected SG = Reading × (1 + 0.000016 × (Temperature - 60) + 0.0000002 × (Temperature - 60)²)

For high-gravity worts (OG > 1.060):
Correction = 0.00039 × (Temp - 60) × (Reading - 1.000)
```

**Temperature Correction Table:**

| Temperature | SG 1.000 | SG 1.020 | SG 1.040 | SG 1.060 | SG 1.080 |
|-------------|----------|----------|----------|----------|----------|
| 40°F | -0.0078 | -0.0076 | -0.0074 | -0.0072 | -0.0070 |
| 50°F | -0.0039 | -0.0038 | -0.0037 | -0.0036 | -0.0035 |
| 60°F | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| 70°F | +0.0039 | +0.0038 | +0.0037 | +0.0036 | +0.0035 |
| 80°F | +0.0078 | +0.0076 | +0.0074 | +0.0072 | +0.0070 |
| 90°F | +0.0117 | +0.0114 | +0.0111 | +0.0108 | +0.0105 |
| 100°F | +0.0156 | +0.0152 | +0.0148 | +0.0144 | +0.0140 |

**Example:**
```
Given:
- Reading: 1.050
- Temperature: 80°F

Corrected SG = 1.050 + 0.00039 × (80 - 60)
Corrected SG = 1.050 + 0.00039 × 20
Corrected SG = 1.050 + 0.0078
Corrected SG = 1.058
```

**Inputs:**
- Measured gravity reading
- Sample temperature (°F or °C)
- Hydrometer calibration temperature (default: 60°F / 15.6°C)

**Output:**
- Temperature-corrected gravity

---

### 3.5 Pitch Rate Calculator

**Purpose:** Calculate the number of yeast cells needed for proper fermentation.

**Formula:**
```
Cells Needed (billions) = Volume (L) × Gravity Points × Pitch Rate

Where:
- Volume = Batch volume in liters
- Gravity Points = (OG - 1) × 1000
- Pitch Rate = Cells per mL per degree Plato
```

**Pitch Rates by Style:**

| Beer Type | Pitch Rate (M/mL/°P) | Notes |
|-----------|----------------------|-------|
| Ale (Standard) | 0.75 | Most ales |
| Ale (High Gravity) | 1.0 | Strong ales, IPAs |
| Lager (Standard) | 1.5 | Most lagers |
| Lager (High Gravity) | 2.0 | Doppelbocks, etc. |
| Belgian | 0.5 - 0.75 | Lower rates desired |
| Wheat Beer | 0.75 - 1.0 | Higher ester production |
| Kveik | 0.25 - 0.5 | Very tolerant yeast |

**Degrees Plato Approximation:**
```
°P = (OG - 1) × 1000 / 4
```

**Example:**
```
Given:
- Batch volume: 19 L
- OG: 1.065
- Beer type: Ale (standard)

Gravity Points = (1.065 - 1) × 1000 = 65
°P = 65 / 4 = 16.25°P
Pitch Rate = 0.75 M/mL/°P

Cells Needed = 19 × 1000 × 16.25 × 0.75
Cells Needed = 19,000 × 16.25 × 0.75
Cells Needed = 231,562.5 million cells
Cells Needed ≈ 232 billion cells
```

**Inputs:**
- Batch volume (L or gal)
- Original Gravity (SG or °P)
- Beer type/style

**Output:**
- Total cells needed (billions)
- Recommended yeast packages/vials
- Starter size recommendation

---

### 3.6 Yeast Starter Calculator

**Purpose:** Calculate the size of yeast starter needed to achieve target cell count.

**Formula:**
```
Starter Volume (mL) = (Cells Needed - Cells Available) / Growth Factor × 1000

Where:
- Cells Needed = From pitch rate calculator
- Cells Available = Cells in purchased yeast package
- Growth Factor = Expected cell multiplication (see table)
```

**Growth Factors by Starter Volume:**

| Starter Volume | Growth Factor | Notes |
|----------------|---------------|-------|
| 100 mL | 1.5 - 2.0 | Minimal starter |
| 250 mL | 2.5 - 3.0 | Small starter |
| 500 mL | 3.5 - 4.0 | Medium starter |
| 1000 mL | 5.0 - 6.0 | Large starter |
| 2000 mL | 6.0 - 8.0 | Very large starter |

**DME for Starter:**
```
DME (g) = Starter Volume (L) × 100 g/L
```

**Example:**
```
Given:
- Cells Needed: 232 billion
- Cells Available: 100 billion (1 pack liquid yeast)
- Starter Volume: 1000 mL

Growth Factor for 1000 mL = 5.5

Starter Volume = (232 - 100) / 5.5 × 1000
Starter Volume = 132 / 5.5 × 1000
Starter Volume = 24,000 mL = 24 L (too large for single starter)

For a 2L starter:
Growth Factor = 6.5
Cells Produced = 100 × 6.5 = 650 billion
Final Count = 100 + 650 = 750 billion (exceeds 232 needed)

DME needed = 2 L × 100 g/L = 200 g DME
```

**Step-Up Starter Formula:**
```
For multiple step-ups:
Step 1: Grow in 1L → ~650 billion cells
Step 2: Use 100mL of Step 1 in new 2L starter
Final: ~2000 billion cells
```

**Inputs:**
- Cells needed (from pitch rate calculator)
- Cells available (from yeast package info)
- Starter type: Single, 2-step, 3-step

**Output:**
- Starter volume (mL)
- DME amount (g)
- Expected cell count
- Step-up schedule (if multi-step)

---

### 3.7 Mash Thickness Calculator

**Purpose:** Calculate the liquor-to-grist ratio for mash.

**Formula:**
```
Ratio = Water Volume (L) / Grain Weight (kg)
```

**Typical Ranges:**

| Style | Ratio (L/kg) | Notes |
|-------|--------------|-------|
| Thin Mash | 4.0 - 5.0 | High fermentability, lighter body |
| Medium Mash | 3.0 - 3.5 | Standard for most styles |
| Thick Mash | 2.5 - 3.0 | Lower fermentability, fuller body |
| Very Thick | 2.0 - 2.5 | Decoction mashing |

**Conversion (US to Metric):**
```
L/kg = qt/lb × 1.186
qt/lb = L/kg × 0.843
```

**Example:**
```
Given:
- Water Volume: 15 L
- Grain Weight: 5 kg

Ratio = 15 / 5 = 3.0 L/kg
This is a medium mash thickness, suitable for most ales.
```

**Inputs:**
- Water volume (L or qt)
- Grain weight (kg or lb)

**Output:**
- Liquor-to-grist ratio (L/kg or qt/lb)
- Recommended range for target style

---

### 3.8 Strike Water Temperature Calculator

**Purpose:** Calculate the exact strike water temperature to hit target mash temperature.

**Basic Formula (No Tun Compensation):**
```
T_strike = (0.2 / R) × (T_target - T_grain) + T_target

Where:
- T_strike = Strike water temperature
- R = Water/grain ratio (L/kg)
- T_target = Target mash temperature
- T_grain = Grain temperature (ambient)
```

**Advanced Formula (With Tun Thermal Mass):**
```
T_strike = (0.2 / R) × (T_target - T_grain) + T_target + Tun_Correction

Where:
Tun_Correction = (Tun_Weight × Tun_Specific_Heat × (T_target - T_grain)) / (Water_Volume × Specific_Heat_water)

Specific_Heat_water = 1.0 cal/g°C
```

**Simplified Formula (Brewfather Method):**
```
T_strike = T_target + (Tun_Heat_Loss + Grain_Cooling) / Water_Volume

Where:
- Tun_Heat_Loss = Tun_Weight × Tun_Specific_Heat × (T_target - T_grain)
- Grain_Cooling = Grain_Weight × 0.4 × (T_target - T_grain)
  (0.4 = specific heat of grain)
```

**Example (Basic):**
```
Given:
- Target mash temp: 67°C
- Grain temp: 22°C
- Water/grain ratio: 3.0 L/kg

T_strike = (0.2 / 3.0) × (67 - 22) + 67
T_strike = 0.0667 × 45 + 67
T_strike = 3.0 + 67
T_strike = 70.0°C
```

**Example (With Tun):**
```
Given:
- Same as above
- Mash tun weight: 5 kg
- Mash tun specific heat: 0.12 cal/g°C
- Water volume: 15 L

Tun_Correction = (5000 × 0.12 × (67 - 22)) / (15000 × 1.0)
Tun_Correction = (600 × 45) / 15000
Tun_Correction = 27000 / 15000
Tun_Correction = 1.8°C

T_strike = 70.0 + 1.8 = 71.8°C
```

**Inputs:**
- Target mash temperature (°C or °F)
- Grain temperature (°C or °F)
- Water/grain ratio (L/kg)
- Mash tun weight (kg or lb)
- Mash tun specific heat (cal/g°C)
- Water volume (L or qt)

**Output:**
- Strike water temperature
- Mash tun correction factor
- Predicted mash temperature (verification)

---

### 3.9 Grain Absorption Rate Calculator

**Purpose:** Calculate how much water grain absorbs during mash.

**Formula:**
```
Absorption = Grain Weight × Absorption Rate

Where:
- Absorption in liters or gallons
- Grain Weight in kg or lbs
- Absorption Rate in L/kg or gal/lb
```

**Typical Absorption Rates:**

| Method | Rate (L/kg) | Rate (gal/lb) | Notes |
|--------|-------------|---------------|-------|
| Standard Mash | 0.8 - 1.0 | 0.096 - 0.12 | 3-vessel, fly sparge |
| BIAB (No Squeeze) | 0.7 - 0.8 | 0.084 - 0.096 | BIAB without squeezing |
| BIAB (Squeezed) | 0.5 - 0.6 | 0.060 - 0.072 | BIAB with bag squeeze |
| Thick Mash | 0.9 - 1.1 | 0.108 - 0.132 | Very thick mashes |
| Thin Mash | 0.7 - 0.9 | 0.084 - 0.108 | Very thin mashes |

**Example:**
```
Given:
- Grain Weight: 5 kg
- Absorption Rate: 0.8 L/kg (standard)

Absorption = 5 × 0.8 = 4.0 L

Total Water Needed = Pre-Boil Volume + Absorption
If Pre-Boil Volume = 25 L:
Total Water = 25 + 4.0 = 29.0 L
```

**Inputs:**
- Grain weight (kg or lbs)
- Absorption rate (L/kg or gal/lb)
- Mash method (standard, BIAB, etc.)

**Output:**
- Total water absorbed
- Total water needed for mash

---

### 3.10 Water Profile Matching Calculator

**Purpose:** Find the closest water profile to your source water from a database of famous water profiles.

**Algorithm:**
```
Distance = √[(Ca_s - Ca_t)² + (Mg_s - Mg_t)² + (Na_s - Na_t)² + 
            (SO4_s - SO4_t)² + (Cl_s - Cl_t)² + (HCO3_s - HCO3_t)²]

Where:
- s = source water profile
- t = target profile from database
```

**Normalization (Optional):**
```
Normalized Distance = √[(Ca_s - Ca_t)²/W_Ca + (Mg_s - Mg_t)²/W_Mg + ...]

Where W = weight factor (1.0 for standard, higher for more important ions)
```

**Famous Water Profiles Database:**

| Profile | Ca | Mg | Na | SO4 | Cl | HCO3 | Style |
|---------|-----|-----|-----|------|-----|-------|-------|
| Pilsen | 7 | 2 | 2 | 5 | 5 | 15 | Pilsner |
| Dublin | 12 | 4 | 12 | 54 | 19 | 315 | Stout |
| Burton | 275 | 40 | 25 | 450 | 35 | 260 | IPA |
| Munich | 75 | 18 | 2 | 10 | 2 | 150 | Bock |
| London | 50 | 15 | 75 | 75 | 35 | 220 | Porter |
| Vienna | 200 | 50 | 8 | 125 | 30 | 200 | Märzen |
| Cologne | 80 | 18 | 20 | 50 | 80 | 180 | Kölsch |
| Edinburgh | 120 | 25 | 15 | 140 | 30 | 300 | Scotch Ale |
| Pilzen (Plzeň) | 7 | 2 | 2 | 5 | 5 | 15 | Czech Pils |

**Example:**
```
Given Source Water:
Ca: 80, Mg: 10, Na: 25, SO4: 40, Cl: 30, HCO3: 120

Distances to famous profiles:
- Pilsen: √[(80-7)² + (10-2)² + (25-2)² + (40-5)² + (30-5)² + (120-15)²] = 132.8
- Dublin: √[(80-12)² + (10-4)² + (25-12)² + (40-54)² + (30-19)² + (120-315)²] = 201.2
- Munich: √[(80-75)² + (10-18)² + (25-2)² + (40-10)² + (30-2)² + (120-150)²] = 42.7
- Vienna: √[(80-200)² + (10-50)² + (25-8)² + (40-125)² + (30-30)² + (120-200)²] = 168.5

Closest match: Munich (distance 42.7)
```

**Inputs:**
- Source water profile (Ca, Mg, Na, SO4, Cl, HCO3 in ppm)

**Output:**
- Ranked list of closest famous profiles
- Distance scores
- Recommended adjustments to match target

---

### 3.11 Mash pH Predictor

**Purpose:** Predict mash pH based on grain bill, water chemistry, and mineral additions.

**Formula (Simplified):**
```
Predicted pH = Base_pH + Grain_Factor + Water_Factor + Additive_Factor

Where:
- Base_pH = 5.8 (typical base for pale malts)
- Grain_Factor = Σ (Grain Weight × Grain Factor) / Total Grain Weight
- Water_Factor = f(Alkalinity, Calcium, Magnesium)
- Additive_Factor = f( mineral additions, acid additions)
```

**Grain Factors (pH Contribution):**

| Grain Type | Factor | Notes |
|------------|--------|-------|
| Base Malt (2-Row) | 0.00 | Reference point |
| Pale Malt | +0.02 | Slightly higher |
| Munich Malt | +0.05 | Higher color = higher pH |
| Vienna Malt | +0.04 | Similar to Munich |
| Crystal 40L | +0.08 | Caramel malts raise pH |
| Crystal 80L | +0.12 | Darker = higher pH |
| Chocolate Malt | +0.25 | Roasted malts raise pH |
| Black Patent | +0.35 | Highest pH contribution |
| Roasted Barley | +0.30 | For stouts |
| Wheat Malt | -0.02 | Slightly lowers pH |
| Acidulated Malt | -0.15 | Designed to lower pH |

**Water Chemistry Effects:**

| Ion | Effect on pH |
|-----|-------------|
| Bicarbonate (HCO3) | Raises mash pH |
| Calcium (Ca) | Lowers mash pH (mild) |
| Magnesium (Mg) | Lowers mash pH (mild) |
| Sulfate (SO4) | Neutral to slight acidifying |
| Chloride (Cl) | Neutral |

**Acid Additions:**

| Acid | Effect |
|------|--------|
| Lactic Acid (88%) | 1 mL lowers pH by ~0.1 per 10L |
| Phosphoric Acid (10%) | 1 mL lowers pH by ~0.05 per 10L |
| Citric Acid | 1 g lowers pH by ~0.02 per 10L |

**Example:**
```
Given:
- Grain bill: 5 kg 2-Row (factor 0.00), 0.5 kg Crystal 40L (factor +0.08)
- Water: 15 L with alkalinity 100 ppm
- No mineral additions

Grain Factor = (5 × 0.00 + 0.5 × 0.08) / 5.5 = 0.04 / 5.5 = +0.007
Water Factor = 100/200 = +0.05 (approximate for alkalinity)

Predicted pH = 5.8 + 0.007 + 0.05 = 5.86

Target: 5.2-5.6 for most styles
Adjustment needed: Add ~1.5 mL lactic acid per 10L
```

**Inputs:**
- Grain bill (weights and types)
- Water profile (Ca, Mg, Na, SO4, Cl, HCO3)
- Mineral additions (gypsum, CaCl2, etc.)
- Acid additions (mL of lactic, phosphoric, etc.)

**Output:**
- Predicted mash pH
- pH range for target style
- Recommended adjustments

---

## 4. Integration with Recipes

### 4.1 Inline Calculators

| Calculator | Integration Point |
|------------|-------------------|
| Refractometer | Brew Day - gravity readings |
| ABV Temperature | Brew Day - gravity readings |
| Pitch Rate | Recipe - yeast section |
| Yeast Starter | Recipe - yeast section |
| Strike Water Temp | Recipe - mash profile |
| Mash Thickness | Recipe - mash profile |
| Grain Absorption | Recipe - water calculations |
| Mash pH | Recipe - water section |

### 4.2 Standalone Calculators

| Calculator | Access |
|------------|--------|
| Priming Sugar | Calculator Hub, Brew Day |
| Carbonation | Calculator Hub, Packaging |
| Water Profile Match | Calculator Hub, Water section |

---

## 5. Integration with Brew Sessions

### 5.1 Auto-Fill from Session

When used during a brew session, calculators auto-fill:
- Batch volume from recipe
- OG from recipe or actual reading
- Beer temperature from session logs

### 5.2 Save to Session

Calculator results can be saved to the brew session:
- Pitch rate used
- Starter volume made
- Strike water temperature
- Water profile applied

---

## 6. Calculator History

All calculator usage is saved to allow:
- Review past calculations
- Compare across batches
- Learn from historical data

**Storage:**
```javascript
{
  userId: ObjectId,
  calculatorType: String,
  inputs: Object,
  result: Object,
  linkedRecipeId: ObjectId,  // optional
  linkedSessionId: ObjectId, // optional
  createdAt: Date
}
```

---

*Prepared by Cody (CTO) and Percy (CPO) - New England Sales Team*
