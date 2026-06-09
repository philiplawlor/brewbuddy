# BrewBuddy - Equipment Profiles & Calculations

**Version:** 0.1.0
**Date:** June 8, 2026

---

## 1. Overview

Equipment is the foundation of accurate recipe calculations. Every brewing system has unique characteristics that affect volume calculations, efficiency, strike water temperature, and hop utilization. BrewBuddy stores equipment profiles that drive all recipe calculations, ensuring predictions match your actual brewing system.

---

## 2. Equipment Profile Schema

### 2.1 Core Fields

| Field | Type | Default | Description | Calculation Impact |
|-------|------|---------|-------------|-------------------|
| `profileName` | String | required | Descriptive label | Identification |
| `isDefault` | Boolean | false | Default profile for new recipes | -- |
| `notes` | String | optional | Additional notes | -- |

### 2.2 Brewhouse Settings

| Field | Type | Default | Range | Description | Calculation Impact |
|-------|------|---------|-------|-------------|-------------------|
| `brewhouseEfficiency` | Number | 72 | 30-100% | Overall system efficiency (grain → fermenter) | **HIGH** - Directly scales OG and all gravity estimates |
| `mashEfficiency` | Number | 75 | 30-100% | Mash procedure efficiency (up to pre-boil) | **MEDIUM** - Drives pre-boil gravity |
| `hopUtilizationFactor` | Number | 100 | 50-200% | Global IBU multiplier | **HIGH** - Scales all Tinseth IBU calculations |

**Efficiency Chain:**
```
Brewhouse Efficiency = Mash Efficiency × (Batch Volume / Pre-Boil Volume)
```

### 2.3 Volume Settings

| Field | Type | Default | Unit | Description | Calculation Impact |
|-------|------|---------|------|-------------|-------------------|
| `batchSize` | Number | 19 | liters | Target volume into fermenter | Starting point for all calculations |
| `preBoilVolume` | Number | 25 | liters | Volume at start of boil | **MEDIUM** - Determines pre-boil gravity |
| `boilOffRate` | Number | 3.5 | L/hr | Volume evaporated per hour | **HIGH** - Determines pre-boil volume |
| `coolingShrinkage` | Number | 4 | % | Volume loss when wort cools | **MEDIUM** - Converts hot/cold volumes |
| `trubChillerLoss` | Number | 1.5 | liters | Wort lost to trub, chiller, piping | **HIGH** - Reduces actual yield |

**Volume Calculation Chain:**
```
Batch Volume (fermenter)
  + Fermentation Loss
  = Post-Chill Kettle Volume
  ÷ (1 - Cooling Shrinkage/100)
  = Hot Post-Boil Volume
  + Boil Off
  = Pre-Boil Volume
  + Trub/Chiller Loss
  = Actual Boil Volume
```

### 2.4 Mash Tun Settings

| Field | Type | Default | Unit | Description | Calculation Impact |
|-------|------|---------|------|-------------|-------------------|
| `mashTunVolume` | Number | 40 | liters | Total internal volume | Constrains max mash water |
| `mashTunWeight` | Number | 5 | kg | Approximate mass | **HIGH** - Thermal mass for strike temp |
| `mashTunSpecificHeat` | Number | 0.12 | cal/g°C | Heat capacity (lower = metal) | **HIGH** - Determines heat absorption |
| `mashTunDeadspace` | Number | 2 | liters | Recoverable deadspace | **MEDIUM** - Added to mash water |
| `mashTunLoss` | Number | 0 | liters | Unrecoverable deadspace | **HIGH** - Reduces collected volume |

**Mash Tun Specific Heat Reference:**

| Material | Specific Heat | Notes |
|----------|---------------|-------|
| Stainless Steel | 0.10-0.12 | Low thermal mass, heats quickly |
| Aluminum | 0.21 | Moderate thermal mass |
| Glass | 0.20 | Moderate thermal mass |
| Plastic/Cooler | 0.30-0.50 | High thermal mass, retains heat |
| Preheated (any) | 0.0-0.1 | Preheating reduces effective heat capacity |

### 2.5 Lauter/HLT Settings

| Field | Type | Default | Unit | Description | Calculation Impact |
|-------|------|---------|------|-------------|-------------------|
| `lauterTunDeadspace` | Number | 1 | liters | Wort trapped in false bottom | **MEDIUM** - Reduces collected volume |
| `hltDeadspace` | Number | 0 | liters | Water trapped in HLT | **LOW** - Extra sparge water needed |

### 2.6 Fermentation/Packaging Settings

| Field | Type | Default | Unit | Description | Calculation Impact |
|-------|------|---------|------|-------------|-------------------|
| `fermenterLoss` | Number | 1 | liters | Loss from fermenter to package | Determines packaged volume |
| `fermentationStages` | Number | 2 | 1-3 | Number of fermentation stages | -- |

### 2.7 Advanced Settings

| Field | Type | Default | Unit | Description | Calculation Impact |
|-------|------|---------|------|-------------|-------------------|
| `grainAbsorptionRate` | Number | 1.0 | L/kg | Water absorbed by grain | **MEDIUM** - Determines total water needed |
| `waterGrainRatio` | Number | 3.0 | L/kg | Mash water per kg of grain | **MEDIUM** - Affects mash thickness |
| `altitude` | Number | 0 | meters | Elevation above sea level | **MEDIUM** - Affects boil temperature |
| `boilTemperature` | Number | 100 | °C | Boil point (auto from altitude) | **MEDIUM** - Affects IBU calculation |
| `largeBatchHopUtilization` | Number | 100 | % | Hop utilization for large batches | **LOW** - Commercial systems use 110-150% |

**Altitude/Boil Temperature Formula:**
```
Boil Temperature = 100 - (0.0034 × Altitude)
Example: 1000m → 96.6°C
```

### 2.8 Auto-Calculation Toggles

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `calcBoilVolume` | Boolean | true | Auto-calculate pre-boil volume |
| `calcMashEfficiency` | Boolean | true | Auto-calculate from brewhouse efficiency |
| `calcStrikeWaterTemp` | Boolean | true | Auto-calculate strike water temperature |

---

## 3. Equipment Categories

### 3.1 Brew Systems

#### Brew in a Bag (BIAB)

| Parameter | Typical Value | Notes |
|-----------|---------------|-------|
| Mash Tun Volume | = Boil Vessel | Same vessel for both |
| Mash Tun Loss | 0 L | No transfer loss |
| Mash Tun Deadspace | 0 L | No false bottom |
| Grain Absorption Rate | 0.6-0.75 L/kg | Lower due to squeeze |
| Brewhouse Efficiency | 65-72% | Lower than 3-vessel |
| Sparge | None or batch sparge | Optional |

**When to use BIAB profile:**
- Single-vessel brewing
- Grain basket or bag
- No separate mash tun

#### Traditional 3-Vessel

| Parameter | Typical Value | Notes |
|-----------|---------------|-------|
| Mash Tun Volume | 35-50 L | Separate from boil kettle |
| Mash Tun Loss | 0.5-2 L | Transfer losses |
| Mash Tun Deadspace | 1-3 L | False bottom, piping |
| Grain Absorption Rate | 0.8-1.0 L/kg | Standard |
| Brewhouse Efficiency | 72-78% | Higher due to sparging |
| Sparge | Fly or batch | Standard |

**When to use 3-vessel profile:**
- Separate mash tun, lauter tun, kettle
- Fly sparge or batch sparge
- HERMS/RIMS systems

#### All-in-One Systems

| System | Capacity | Typical Efficiency | Notable Settings |
|--------|----------|-------------------|------------------|
| Grainfather G30 | 30 L | 68-75% | Counterflow chiller loss ~1 L |
| Grainfather G40 | 40 L | 68-75% | Larger capacity |
| Grainfather G70 | 70 L | 70-78% | Half-barrel |
| Brewzilla 35L | 35 L | 65-72% | Budget option |
| Brewzilla 65L | 65 L | 68-75% | Larger budget |
| Clawhammer 10G | 38 L | 68-75% | DIY-focused |
| Anvil Foundry | 25/40 L | 68-75% | BIAB-converted |

**Common all-in-one characteristics:**
- Single vessel (mash + boil)
- Grain basket or bag (BIAB-style)
- Built-in pump
- Typically 0 mash-tun loss
- Mash-tun deadspace = volume below grain basket

### 3.2 Fermentation Vessels

| Vessel Type | Fermenter Loss | Pros | Cons |
|-------------|----------------|------|------|
| Conical (SS) | 0.5-1 L | Yeast collection, easy racking | Expensive |
| Conical (Plastic) | 1-1.5 L | Affordable conical | Less durable |
| Glass Carboy | 0.5-1 L | Oxygen barrier | Heavy, breakable |
| Plastic Bucket | 1-2 L | Cheap, lightweight | Oxygen permeable |
| PET Carboy | 0.5-1 L | Lightweight, O2 barrier | Can scratch |
| FermZilla/Unitank | 0.3-0.8 L | Pressure capable, glycol | Expensive |

### 3.3 Wort Chillers

| Chiller Type | Trub/Chiller Loss | Chill Time | Notes |
|--------------|-------------------|------------|-------|
| Immersion | 0.5-1.5 L | 15-30 min | Simple, affordable |
| Counterflow | 0.5-1 L | 8-12 min | Grainfather uses this |
| Plate | 0.3-0.8 L | 5-10 min | Fastest, requires cleaning |
| No-Chill | 0 L | 24+ hr | Zero loss, extended hot stand |

### 3.4 Packaging Systems

| System | Loss | Notes |
|--------|------|-------|
| Kegging (ball lock) | 0.5-1 L | Dead beer in keg |
| Kegging (pin lock) | 0.5-1 L | Similar to ball lock |
| Bottling (standard) | 1-2 L | Priming sugar loss |
| Bottling (counter-pressure) | 0.3-0.5 L | Reduced oxidation |

---

## 4. Pre-Built Equipment Profiles

### 4.1 Generic Profiles (MVP)

BrewBuddy ships with these generic pre-built profiles:

#### 5 Gallon All-Grain (3-Vessel)

```json
{
  "profileName": "5 Gallon All-Grain (3-Vessel)",
  "brewhouseEfficiency": 72,
  "mashEfficiency": 76,
  "batchSize": 19,
  "preBoilVolume": 25.5,
  "boilOffRate": 3.5,
  "coolingShrinkage": 4,
  "trubChillerLoss": 1.5,
  "mashTunVolume": 35,
  "mashTunWeight": 5,
  "mashTunSpecificHeat": 0.12,
  "mashTunDeadspace": 2,
  "mashTunLoss": 1,
  "lauterTunDeadspace": 1,
  "fermenterLoss": 1,
  "grainAbsorptionRate": 1.0,
  "waterGrainRatio": 3.0,
  "hopUtilizationFactor": 100
}
```

#### 5 Gallon BIAB

```json
{
  "profileName": "5 Gallon BIAB",
  "brewhouseEfficiency": 68,
  "mashEfficiency": 72,
  "batchSize": 19,
  "preBoilVolume": 26,
  "boilOffRate": 3.5,
  "coolingShrinkage": 4,
  "trubChillerLoss": 1.5,
  "mashTunVolume": 40,
  "mashTunWeight": 3,
  "mashTunSpecificHeat": 0.12,
  "mashTunDeadspace": 0,
  "mashTunLoss": 0,
  "lauterTunDeadspace": 0,
  "fermenterLoss": 1,
  "grainAbsorptionRate": 0.7,
  "waterGrainRatio": 4.0,
  "hopUtilizationFactor": 100
}
```

#### 10 Gallon All-Grain (3-Vessel)

```json
{
  "profileName": "10 Gallon All-Grain (3-Vessel)",
  "brewhouseEfficiency": 74,
  "mashEfficiency": 78,
  "batchSize": 38,
  "preBoilVolume": 50,
  "boilOffRate": 6,
  "coolingShrinkage": 4,
  "trubChillerLoss": 2,
  "mashTunVolume": 70,
  "mashTunWeight": 8,
  "mashTunSpecificHeat": 0.12,
  "mashTunDeadspace": 3,
  "mashTunLoss": 1.5,
  "lauterTunDeadspace": 2,
  "fermenterLoss": 1.5,
  "grainAbsorptionRate": 1.0,
  "waterGrainRatio": 3.0,
  "hopUtilizationFactor": 100
}
```

#### 10 Gallon BIAB

```json
{
  "profileName": "10 Gallon BIAB",
  "brewhouseEfficiency": 70,
  "mashEfficiency": 74,
  "batchSize": 38,
  "preBoilVolume": 51,
  "boilOffRate": 6,
  "coolingShrinkage": 4,
  "trubChillerLoss": 2,
  "mashTunVolume": 80,
  "mashTunWeight": 5,
  "mashTunSpecificHeat": 0.12,
  "mashTunDeadspace": 0,
  "mashTunLoss": 0,
  "lauterTunDeadspace": 0,
  "fermenterLoss": 1.5,
  "grainAbsorptionRate": 0.7,
  "waterGrainRatio": 4.0,
  "hopUtilizationFactor": 100
}
```

#### 5 Gallon Extract/Partial Mash

```json
{
  "profileName": "5 Gallon Extract/Partial Mash",
  "brewhouseEfficiency": 60,
  "mashEfficiency": 65,
  "batchSize": 19,
  "preBoilVolume": 23,
  "boilOffRate": 3.5,
  "coolingShrinkage": 4,
  "trubChillerLoss": 1,
  "mashTunVolume": 20,
  "mashTunWeight": 2,
  "mashTunSpecificHeat": 0.3,
  "mashTunDeadspace": 0,
  "mashTunLoss": 0,
  "lauterTunDeadspace": 0,
  "fermenterLoss": 1,
  "grainAbsorptionRate": 0.8,
  "waterGrainRatio": 2.5,
  "hopUtilizationFactor": 100
}
```

### 4.2 Custom Profile Creation Guide

**Step 1: Measure Your System**

| Measurement | How to Measure |
|-------------|----------------|
| Batch Volume | Measure actual volume into fermenter after last brew |
| Boil Off Rate | Boil known volume for 60 min, measure difference |
| Trub/Chiller Loss | Measure volume left in kettle after transfer |
| Mash Tun Weight | Weigh empty mash tun on bathroom scale |
| Mash Tun Volume | Fill with water, measure volume |
| Deadspace | Drain mash tun completely, measure remaining liquid |

**Step 2: Calibrate Efficiency**

1. Brew a batch with known grain bill
2. Measure actual OG
3. Compare to predicted OG
4. Adjust brewhouse efficiency until predictions match

**Step 3: Calibrate Strike Temperature**

1. Measure grain temperature (ambient)
2. Heat strike water to calculated temperature
3. Mash in, wait 5 minutes
4. Measure actual mash temperature
5. Adjust mash tun specific heat until predictions match

---

## 5. Equipment-Recipe Integration

### 5.1 How Equipment Affects Recipe Calculations

#### OG (Original Gravity) Calculation

```
OG = 1 + (Total Grain Points × Efficiency) / (Batch Volume × 3.83)

Where:
- Total Grain Points = Σ (Grain Weight × Potential Extract)
- Efficiency = Brewhouse Efficiency from equipment profile
- Batch Volume = Target volume from equipment profile
- 3.83 = Conversion factor (lbs/gal to SG points)
```

#### IBU (International Bitterness Units) Calculation

**Tinseth Formula:**
```
IBU = (Weight × Utilization × Alpha Acid × 7489) / Volume

Where:
- Utilization = Bigness Factor × Boil Time Factor
- Bigness Factor = 1.65 × 0.000125^(OG - 1)
- Boil Time Factor = (1 - e^(-0.04 × Time)) / 4.15
- Utilization Factor = hopUtilizationFactor from equipment profile
```

**Equipment Impact:**
- Higher gravity = lower utilization (bigness factor)
- Longer boil = higher utilization (time factor)
- Hop utilization factor = global multiplier

#### Volume Calculations

```
Pre-Boil Volume = (Batch Volume + Fermentation Loss) / (1 - Cooling Shrinkage/100) + Boil Off + Trub Chiller Loss

Mash Water = (Grain Weight × Grain Absorption Rate) + Mash Tun Deadspace + (Pre-Boil Volume - Sparge Water)

Sparge Water = Pre-Boil Volume - Mash Water + Grain Absorption Rate
```

### 5.2 Strike Water Temperature Calculation

**Formula:**
```
T_strike = (0.2 / R) × (T_target - T_grain) + T_target

Where:
- T_strike = Target strike water temperature
- R = Water/Grain ratio (L/kg)
- T_target = Target mash temperature
- T_grain = Grain temperature (ambient)

If accounting for mash tun thermal mass:
T_strike = T_strike + (Tun_Heat_Loss / Water_Volume)

Where:
- Tun_Heat_Loss = Mash Tun Weight × Mash Tun Specific Heat × (T_target - T_grain)
```

**Example:**
```
Given:
- Target mash temp: 67°C
- Grain temp: 22°C
- Water/grain ratio: 3.0 L/kg
- Mash tun weight: 5 kg
- Mash tun specific heat: 0.12 cal/g°C

Basic calculation:
T_strike = (0.2 / 3.0) × (67 - 22) + 67
T_strike = 0.0667 × 45 + 67
T_strike = 3.0 + 67 = 70.0°C

With tun thermal mass:
Tun_Heat_Loss = 5000 × 0.12 × (67 - 22) = 27,000 cal
Tun_Heat_Correction = 27,000 / (Water_Volume × 1000)
For 15L water: 27,000 / 15,000 = 1.8°C
T_strike = 70.0 + 1.8 = 71.8°C
```

### 5.3 Brewhouse Efficiency Chain

```
Conversion Efficiency
    × Lautering Efficiency
    = Mash Efficiency
    × (Batch Volume / Pre-Boil Volume)
    = Brewhouse Efficiency

Where:
- Conversion Efficiency: Starch → Sugar (affected by crush, temp, time)
- Lautering Efficiency: Sugar extraction during sparge
- Mash Efficiency: Grain → Pre-boil wort
- Brewhouse Efficiency: Grain → Fermenter (includes all losses)
```

---

## 6. Equipment Selection in Recipe Creation

### 6.1 Workflow

1. **Create Recipe** → Equipment selector appears at top
2. **Select Equipment Profile** → Choose from pre-built or custom
3. **Calculations Update** → All recipe estimates recalculate
4. **Override if Needed** → Can adjust efficiency per recipe

### 6.2 Equipment Profile Modal

```
┌─────────────────────────────────────────┐
│  Select Equipment Profile          [X]  │
├─────────────────────────────────────────┤
│  [Default: 5 Gallon BIAB]         [▼]  │
│                                         │
│  Pre-Built:                             │
│  • 5 Gallon All-Grain (3-Vessel)       │
│  • 5 Gallon BIAB                       │
│  • 10 Gallon All-Grain (3-Vessel)      │
│  • 10 Gallon BIAB                      │
│  • 5 Gallon Extract/Partial Mash       │
│                                         │
│  Custom:                                │
│  • My Home Setup                        │
│  • Garage System                        │
│  [+ Create New Profile]                │
│                                         │
│  Profile Summary:                       │
│  Batch: 19L | Efficiency: 68%          │
│  Boil Off: 3.5L/hr | Trub Loss: 1.5L  │
│                                         │
│  [Cancel]                    [Select]   │
└─────────────────────────────────────────┘
```

---

## 7. v2 Equipment Features (Planned)

| Feature | Description |
|---------|-------------|
| Smart Equipment Profiles | Auto-adjust based on historical batch data |
| Equipment-Specific Pre-Builts | Grainfather, Brewzilla, Clawhammer profiles |
| Equipment Comparison | Compare two setups side-by-side |
| Equipment Maintenance | Track cleaning, part replacements |
| Remote Equipment Control | Integration with smart brewing systems |

---

*Prepared by Cody (CTO) and Percy (CPO) - New England Sales Team*
