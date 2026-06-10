import { IRecipe, IRecipeIngredient } from '../types/recipe';

// Unit conversion constants
const LB_TO_KG = 0.45359237;
const KG_TO_LB = 1 / LB_TO_KG; // 2.20462
const OZ_TO_KG = 0.02834952;
const KG_TO_OZ = 1 / OZ_TO_KG; // 35.274
const G_TO_KG = 0.001;
const L_TO_GAL = 0.264172;
const GAL_TO_L = 3.78541;

// Standard brewing conversion factor: gal_to_L / kg_to_lb = 3.78541 / 0.453592
const METRIC_CONVERSION = 8.34540;

/**
 * Convert weight to kilograms
 */
export function convertToKg(
  weight: number,
  unit: 'kg' | 'lb' | 'g' | 'oz'
): number {
  switch (unit) {
    case 'kg':
      return weight;
    case 'lb':
      return weight * LB_TO_KG;
    case 'g':
      return weight * G_TO_KG;
    case 'oz':
      return weight * OZ_TO_KG;
    default:
      throw new Error(`Unknown weight unit: ${unit}`);
  }
}

/**
 * Convert weight to ounces
 */
export function convertToOz(
  weight: number,
  unit: 'kg' | 'lb' | 'g' | 'oz'
): number {
  return convertToKg(weight, unit) * KG_TO_OZ;
}

/**
 * Convert weight to pounds
 */
export function convertToLb(
  weight: number,
  unit: 'kg' | 'lb' | 'g' | 'oz'
): number {
  return convertToKg(weight, unit) * KG_TO_LB;
}

/**
 * Calculate Original Gravity from fermentable ingredients
 * Uses PPG (points per pound per gallon) for potential extract.
 * Standard formula: OG_points = (weight_lbs × PPG × yield × efficiency) / volume_gallons
 * Metric adaptation: multiply by 8.34540 (gal_to_L / kg_to_lb)
 * OG = 1 + gravityPoints / 1000
 *
 * @param fermentables - Array of grain/fermentable ingredients
 * @param efficiency - Brewhouse efficiency (0-1)
 * @param batchSize - Final batch size in liters
 * @returns Original Gravity (e.g., 1.050)
 */
export function calculateOG(
  fermentables: IRecipeIngredient[],
  efficiency: number,
  batchSize: number
): number {
  if (batchSize <= 0) {
    throw new Error('Batch size must be greater than 0');
  }
  if (efficiency < 0 || efficiency > 1) {
    throw new Error('Efficiency must be between 0 and 1');
  }

  let totalPoints = 0;

  for (const fermentable of fermentables) {
    if (
      fermentable.ingredientType !== 'grain' ||
      !fermentable.grainWeight ||
      !fermentable.potentialExtract
    ) {
      continue;
    }

    const weightInKg = convertToKg(
      fermentable.grainWeight,
      fermentable.grainWeightUnit || 'kg'
    );

    // potentialExtract is in PPG (points per pound per gallon)
    // e.g., 37 for standard 2-row
    const yieldDecimal = fermentable.yieldPercent
      ? fermentable.yieldPercent / 100
      : 1;

    // Convert to PPG-based formula for metric:
    // weight_kg × PPG × yield × efficiency × 8.34540 / batchSize_L
    const points =
      weightInKg * fermentable.potentialExtract * yieldDecimal * METRIC_CONVERSION;
    totalPoints += points;
  }

  const gravityPoints = (totalPoints * efficiency) / batchSize;
  // gravityPoints are in standard gravity points (e.g., 53 means SG 1.053)
  // Divide by 1000 to get decimal above 1.0
  return 1 + gravityPoints / 1000;
}

/**
 * Calculate Final Gravity from OG and yeast attenuation
 * FG = 1 + (OG - 1) * (1 - attenuation)
 *
 * @param og - Original Gravity (e.g., 1.050)
 * @param attenuation - Yeast attenuation as decimal (e.g., 0.75 for 75%)
 * @returns Final Gravity (e.g., 1.012)
 */
export function calculateFG(og: number, attenuation: number): number {
  if (og < 1) {
    throw new Error('OG must be at least 1.0');
  }
  if (attenuation < 0 || attenuation > 1) {
    throw new Error('Attenuation must be between 0 and 1');
  }

  return 1 + (og - 1) * (1 - attenuation);
}

/**
 * Calculate IBU using Tinseth formula
 * Standard imperial: IBU = (weight_oz × alphaAcid × utilization × 7489) / volume_gallons
 * Converts metric inputs to imperial for calculation.
 *
 * @param hops - Array of hops ingredients
 * @param og - Original Gravity
 * @param batchSize - Final batch size in liters
 * @returns IBU (International Bitterness Units)
 */
export function calculateIBU(
  hops: IRecipeIngredient[],
  og: number,
  batchSize: number
): number {
  if (batchSize <= 0) {
    throw new Error('Batch size must be greater than 0');
  }

  let totalIbu = 0;

  for (const hop of hops) {
    if (
      hop.ingredientType !== 'hops' ||
      !hop.hopsWeight ||
      hop.hopAlphaAcid === undefined ||
      hop.hopAlphaAcid === null ||
      !hop.hopBoilMinutes
    ) {
      continue;
    }

    // Convert to imperial for standard Tinseth calculation
    const weightOz = convertToOz(
      hop.hopsWeight,
      hop.hopsWeightUnit || 'g'
    );
    const volumeGal = batchSize * L_TO_GAL;

    // Alpha acid as decimal (e.g., 5.5% becomes 0.055)
    const alphaAcidDecimal = hop.hopAlphaAcid / 100;

    // Tinseth utilization formula
    const time = hop.hopBoilMinutes;
    const bignessFactor = 1.65 * Math.pow(0.000125, og - 1);
    const boilTimeFactor = (1 - Math.exp(-0.04 * time)) / 4.15;
    const utilization = bignessFactor * boilTimeFactor;

    // Standard Tinseth: IBU = (oz × AA × U × 7489) / gallons
    const hopIbu =
      (weightOz * alphaAcidDecimal * utilization * 7489) / volumeGal;
    totalIbu += hopIbu;
  }

  return totalIbu;
}

/**
 * Calculate SRM (color) using Morey equation
 * MCU (Malt Color Units) = (weight_lbs × lovibond) / volume_gallons
 * Converts metric inputs to imperial for MCU calculation.
 * SRM = 1.4922 × MCU^0.6859
 *
 * @param fermentables - Array of grain/fermentable ingredients
 * @param batchSize - Final batch size in liters
 * @returns SRM (Standard Reference Method) color value
 */
export function calculateSRM(
  fermentables: IRecipeIngredient[],
  batchSize: number
): number {
  if (batchSize <= 0) {
    throw new Error('Batch size must be greater than 0');
  }

  let mcuSum = 0;

  for (const fermentable of fermentables) {
    if (
      fermentable.ingredientType !== 'grain' ||
      !fermentable.grainWeight ||
      !fermentable.lovibond
    ) {
      continue;
    }

    // Convert to imperial for MCU calculation
    const weightLbs = convertToLb(
      fermentable.grainWeight,
      fermentable.grainWeightUnit || 'kg'
    );
    const volumeGal = batchSize * L_TO_GAL;

    // MCU = (weight_lbs × lovibond) / volume_gallons
    const mcu = (weightLbs * fermentable.lovibond) / volumeGal;
    mcuSum += mcu;
  }

  // Morey equation
  return 1.4922 * Math.pow(mcuSum, 0.6859);
}

/**
 * Calculate ABV from OG and FG
 * ABV = (OG - FG) * 131.25
 *
 * @param og - Original Gravity (e.g., 1.050)
 * @param fg - Final Gravity (e.g., 1.012)
 * @returns ABV as percentage (e.g., 5.0)
 */
export function calculateABV(og: number, fg: number): number {
  if (og < 1) {
    throw new Error('OG must be at least 1.0');
  }
  if (fg < 1) {
    throw new Error('FG must be at least 1.0');
  }
  if (fg > og) {
    throw new Error('FG cannot be greater than OG');
  }

  return (og - fg) * 131.25;
}

/**
 * Calculate calories per 12oz serving (approximate)
 * Formula: Calories ≈ ABV × 22.8
 * Where ABV is alcohol by volume percentage
 *
 * @param og - Original Gravity
 * @param fg - Final Gravity
 * @returns Approximate calories per 12oz serving
 */
export function calculateCalories(og: number, fg: number): number {
  if (og < 1) {
    throw new Error('OG must be at least 1.0');
  }
  if (fg < 1) {
    throw new Error('FG must be at least 1.0');
  }

  const abv = calculateABV(og, fg);
  // ABV × 22.8 gives approximate calories per 12oz serving
  return abv * 22.8;
}

/**
 * Calculate all recipe statistics
 *
 * @param recipe - Recipe with batch settings
 * @param ingredients - All recipe ingredients
 * @param attenuation - Yeast attenuation as decimal
 * @returns Object with all calculated stats
 */
export function calculateAllRecipeStats(
  recipe: IRecipe,
  ingredients: IRecipeIngredient[],
  attenuation: number = 0.75
): {
  og: number;
  fg: number;
  ibu: number;
  srm: number;
  abv: number;
  calories: number;
} {
  const batchSize = recipe.batchSize || 20; // Default 20L
  const efficiency = (recipe.efficiency || 72) / 100; // Convert from % to decimal

  const fermentables = ingredients.filter(
    (i) => i.ingredientType === 'grain'
  );
  const hops = ingredients.filter((i) => i.ingredientType === 'hops');

  const og = calculateOG(fermentables, efficiency, batchSize);
  const fg = calculateFG(og, attenuation);
  const ibu = calculateIBU(hops, og, batchSize);
  const srm = calculateSRM(fermentables, batchSize);
  const abv = calculateABV(og, fg);
  const calories = calculateCalories(og, fg);

  return {
    og: Math.round(og * 1000) / 1000,
    fg: Math.round(fg * 1000) / 1000,
    ibu: Math.round(ibu * 10) / 10,
    srm: Math.round(srm * 10) / 10,
    abv: Math.round(abv * 10) / 10,
    calories: Math.round(calories * 10) / 10,
  };
}

/**
 * Get estimated stats ready for recipe update
 *
 * @param recipe - Current recipe
 * @param ingredients - All recipe ingredients
 * @param attenuation - Yeast attenuation (0-1)
 * @returns Partial recipe with estimated stats
 */
export function getEstimatedStatsForUpdate(
  recipe: IRecipe,
  ingredients: IRecipeIngredient[],
  attenuation: number = 0.75
): Partial<IRecipe> {
  const stats = calculateAllRecipeStats(recipe, ingredients, attenuation);

  return {
    estimatedOg: stats.og,
    estimatedFg: stats.fg,
    estimatedAbv: stats.abv,
    estimatedIbu: stats.ibu,
    estimatedSrm: stats.srm,
    estimatedCalories: stats.calories,
  };
}
