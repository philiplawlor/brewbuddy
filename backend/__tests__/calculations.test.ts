import {
  convertToKg,
  convertToOz,
  convertToLb,
  calculateOG,
  calculateFG,
  calculateIBU,
  calculateSRM,
  calculateABV,
  calculateCalories,
  calculateAllRecipeStats,
  getEstimatedStatsForUpdate,
} from '../src/utils/calculations';
import { IRecipeIngredient, IRecipe } from '../src/types/recipe';

// Helper to create test ingredients
function g(overrides: Partial<IRecipeIngredient> = {}): IRecipeIngredient {
  return { ingredientType: 'grain', order: 1, ...overrides } as IRecipeIngredient;
}

function h(overrides: Partial<IRecipeIngredient> = {}): IRecipeIngredient {
  return { ingredientType: 'hops', order: 1, ...overrides } as IRecipeIngredient;
}

function recipe(overrides: Partial<IRecipe> = {}): IRecipe {
  return {
    userId: 'user1' as any,
    recipeName: 'Test Recipe',
    method: 'all_grain',
    version: 1,
    isTemplate: false,
    isPublic: false,
    isArchived: false,
    ...overrides,
  };
}

describe('Brewing Calculations', () => {
  describe('Unit Conversions', () => {
    it('should convert kg to kg', () => {
      expect(convertToKg(1, 'kg')).toBe(1);
    });

    it('should convert lb to kg', () => {
      expect(convertToKg(1, 'lb')).toBeCloseTo(0.4536, 4);
    });

    it('should convert g to kg', () => {
      expect(convertToKg(1000, 'g')).toBe(1);
    });

    it('should convert oz to kg', () => {
      expect(convertToKg(1, 'oz')).toBeCloseTo(0.02835, 4);
    });

    it('should convert kg to oz', () => {
      expect(convertToOz(1, 'kg')).toBeCloseTo(35.274, 2);
    });

    it('should convert g to oz', () => {
      expect(convertToOz(28, 'g')).toBeCloseTo(0.988, 2);
    });

    it('should convert kg to lb', () => {
      expect(convertToLb(1, 'kg')).toBeCloseTo(2.2046, 3);
    });

    it('should convert g to lb', () => {
      expect(convertToLb(1000, 'g')).toBeCloseTo(2.2046, 3);
    });
  });

  describe('calculateOG', () => {
    it('should calculate OG for a simple grain bill', () => {
      const fermentables = [g({
        name: 'Pale 2-Row',
        grainWeight: 5,
        grainWeightUnit: 'kg',
        potentialExtract: 37,
        yieldPercent: 80,
      })];

      const og = calculateOG(fermentables, 0.72, 20);
      expect(og).toBeGreaterThan(1.04);
      expect(og).toBeLessThan(1.05);
    });

    it('should calculate OG with multiple grains', () => {
      const fermentables = [
        g({ name: 'Pale 2-Row', grainWeight: 4, grainWeightUnit: 'kg', potentialExtract: 37, yieldPercent: 80 }),
        g({ name: 'Crystal 60', grainWeight: 0.5, grainWeightUnit: 'kg', potentialExtract: 34, yieldPercent: 75 }),
      ];

      const og = calculateOG(fermentables, 0.72, 20);
      expect(og).toBeGreaterThan(1);
      expect(og).toBeLessThan(1.1);
    });

    it('should handle grain weight in lb', () => {
      const fermentables = [g({
        name: 'Pale 2-Row',
        grainWeight: 10,
        grainWeightUnit: 'lb',
        potentialExtract: 37,
        yieldPercent: 80,
      })];

      const og = calculateOG(fermentables, 0.72, 18.93);
      expect(og).toBeGreaterThan(1.04);
      expect(og).toBeLessThan(1.08);
    });

    it('should skip non-grain ingredients', () => {
      const fermentables = [
        g({ name: 'Pale 2-Row', grainWeight: 5, grainWeightUnit: 'kg', potentialExtract: 37, yieldPercent: 80 }),
        h({ name: 'Cascade' }),
      ];

      const og = calculateOG(fermentables, 0.72, 20);
      expect(og).toBeGreaterThan(1);
    });

    it('should throw error if batchSize is 0', () => {
      expect(() => calculateOG([], 0.72, 0)).toThrow('Batch size must be greater than 0');
    });

    it('should throw error if efficiency is invalid', () => {
      expect(() => calculateOG([], -0.1, 20)).toThrow('Efficiency must be between 0 and 1');
      expect(() => calculateOG([], 1.1, 20)).toThrow('Efficiency must be between 0 and 1');
    });

    it('should return 1.0 for empty grain bill', () => {
      expect(calculateOG([], 0.72, 20)).toBe(1);
    });

    it('should increase OG with more grain', () => {
      const small = [g({ grainWeight: 3, grainWeightUnit: 'kg', potentialExtract: 37, yieldPercent: 80 })];
      const large = [g({ grainWeight: 7, grainWeightUnit: 'kg', potentialExtract: 37, yieldPercent: 80 })];

      expect(calculateOG(large, 0.72, 20)).toBeGreaterThan(calculateOG(small, 0.72, 20));
    });
  });

  describe('calculateFG', () => {
    it('should calculate FG from OG and attenuation', () => {
      expect(calculateFG(1.05, 0.75)).toBeCloseTo(1.0125, 4);
    });

    it('should handle 0% attenuation', () => {
      expect(calculateFG(1.05, 0)).toBe(1.05);
    });

    it('should handle 100% attenuation', () => {
      expect(calculateFG(1.05, 1)).toBe(1);
    });

    it('should throw error if OG < 1', () => {
      expect(() => calculateFG(0.99, 0.75)).toThrow('OG must be at least 1.0');
    });

    it('should throw error if attenuation is invalid', () => {
      expect(() => calculateFG(1.05, -0.1)).toThrow('Attenuation must be between 0 and 1');
      expect(() => calculateFG(1.05, 1.1)).toThrow('Attenuation must be between 0 and 1');
    });

    it('should decrease FG with higher attenuation', () => {
      expect(calculateFG(1.06, 0.80)).toBeLessThan(calculateFG(1.06, 0.65));
    });
  });

  describe('calculateIBU', () => {
    it('should calculate IBU using Tinseth formula', () => {
      const hops = [h({
        name: 'Cascade',
        hopsWeight: 28,
        hopsWeightUnit: 'g',
        hopAlphaAcid: 5.5,
        hopBoilMinutes: 60,
      })];

      const ibu = calculateIBU(hops, 1.05, 20);
      expect(ibu).toBeGreaterThan(10);
      expect(ibu).toBeLessThan(50);
    });

    it('should calculate IBU for multiple hop additions', () => {
      const hops = [
        h({ name: 'Cascade', hopsWeight: 28, hopsWeightUnit: 'g', hopAlphaAcid: 5.5, hopBoilMinutes: 60 }),
        h({ name: 'Centennial', hopsWeight: 14, hopsWeightUnit: 'g', hopAlphaAcid: 10, hopBoilMinutes: 15 }),
      ];

      expect(calculateIBU(hops, 1.05, 20)).toBeGreaterThan(15);
    });

    it('should handle hop weight in oz', () => {
      const hops = [h({
        name: 'Cascade',
        hopsWeight: 1,
        hopsWeightUnit: 'oz',
        hopAlphaAcid: 5.5,
        hopBoilMinutes: 60,
      })];

      expect(calculateIBU(hops, 1.05, 20)).toBeGreaterThan(15);
    });

    it('should skip hops without required fields', () => {
      const hops = [h({ name: 'Cascade' })];
      expect(calculateIBU(hops, 1.05, 20)).toBe(0);
    });

    it('should throw error if batchSize is 0', () => {
      expect(() => calculateIBU([], 1.05, 0)).toThrow('Batch size must be greater than 0');
    });

    it('should return 0 for empty hops array', () => {
      expect(calculateIBU([], 1.05, 20)).toBe(0);
    });

    it('should produce higher IBU for longer boil times', () => {
      const shortBoil = [h({ hopsWeight: 28, hopsWeightUnit: 'g', hopAlphaAcid: 5.5, hopBoilMinutes: 15 })];
      const longBoil = [h({ hopsWeight: 28, hopsWeightUnit: 'g', hopAlphaAcid: 5.5, hopBoilMinutes: 60 })];

      expect(calculateIBU(longBoil, 1.05, 20)).toBeGreaterThan(calculateIBU(shortBoil, 1.05, 20));
    });

    it('should produce higher IBU with higher alpha acid', () => {
      const lowAA = [h({ hopsWeight: 28, hopsWeightUnit: 'g', hopAlphaAcid: 4, hopBoilMinutes: 60 })];
      const highAA = [h({ hopsWeight: 28, hopsWeightUnit: 'g', hopAlphaAcid: 10, hopBoilMinutes: 60 })];

      expect(calculateIBU(highAA, 1.05, 20)).toBeGreaterThan(calculateIBU(lowAA, 1.05, 20));
    });
  });

  describe('calculateSRM', () => {
    it('should calculate SRM for a single grain', () => {
      const fermentables = [g({ name: 'Pale 2-Row', grainWeight: 5, grainWeightUnit: 'kg', lovibond: 2 })];
      const srm = calculateSRM(fermentables, 20);
      expect(srm).toBeGreaterThan(3);
      expect(srm).toBeLessThan(6);
    });

    it('should calculate SRM for multiple grains', () => {
      const fermentables = [
        g({ name: 'Pale 2-Row', grainWeight: 4, grainWeightUnit: 'kg', lovibond: 2 }),
        g({ name: 'Crystal 60', grainWeight: 0.5, grainWeightUnit: 'kg', lovibond: 60 }),
      ];

      const srm = calculateSRM(fermentables, 20);
      expect(srm).toBeGreaterThan(5);
      expect(srm).toBeLessThan(20);
    });

    it('should throw error if batchSize is 0', () => {
      expect(() => calculateSRM([], 0)).toThrow('Batch size must be greater than 0');
    });

    it('should return 0 for empty grain bill', () => {
      expect(calculateSRM([], 20)).toBe(0);
    });

    it('should produce darker color with more lovibond', () => {
      const light = [g({ grainWeight: 5, grainWeightUnit: 'kg', lovibond: 2 })];
      const dark = [g({ grainWeight: 5, grainWeightUnit: 'kg', lovibond: 350 })];

      expect(calculateSRM(dark, 20)).toBeGreaterThan(calculateSRM(light, 20));
    });

    it('should handle grain weight in lb', () => {
      const fermentables = [g({ grainWeight: 10, grainWeightUnit: 'lb', lovibond: 2 })];
      const srm = calculateSRM(fermentables, 18.93);
      expect(srm).toBeGreaterThan(3);
      expect(srm).toBeLessThan(6);
    });
  });

  describe('calculateABV', () => {
    it('should calculate ABV from OG and FG', () => {
      expect(calculateABV(1.05, 1.012)).toBeCloseTo(4.99, 1);
    });

    it('should calculate ABV for high gravity beer', () => {
      expect(calculateABV(1.1, 1.02)).toBeCloseTo(10.5, 1);
    });

    it('should throw error if OG < 1', () => {
      expect(() => calculateABV(0.99, 1.01)).toThrow('OG must be at least 1.0');
    });

    it('should throw error if FG < 1', () => {
      expect(() => calculateABV(1.05, 0.99)).toThrow('FG must be at least 1.0');
    });

    it('should throw error if FG > OG', () => {
      expect(() => calculateABV(1.05, 1.06)).toThrow('FG cannot be greater than OG');
    });

    it('should increase ABV with higher OG', () => {
      expect(calculateABV(1.08, 1.01)).toBeGreaterThan(calculateABV(1.04, 1.01));
    });
  });

  describe('calculateCalories', () => {
    it('should calculate calories for a beer', () => {
      const calories = calculateCalories(1.05, 1.012);
      expect(calories).toBeGreaterThan(100);
      expect(calories).toBeLessThan(250);
    });

    it('should throw error if OG < 1', () => {
      expect(() => calculateCalories(0.99, 1.01)).toThrow('OG must be at least 1.0');
    });

    it('should throw error if FG < 1', () => {
      expect(() => calculateCalories(1.05, 0.99)).toThrow('FG must be at least 1.0');
    });

    it('should increase calories with higher gravity', () => {
      expect(calculateCalories(1.08, 1.01)).toBeGreaterThan(calculateCalories(1.04, 1.01));
    });
  });

  describe('calculateAllRecipeStats', () => {
    const r = recipe({ batchSize: 20, efficiency: 72 });
    const ingredients = [
      g({ name: 'Pale 2-Row', grainWeight: 5, grainWeightUnit: 'kg', lovibond: 2, potentialExtract: 37, yieldPercent: 80 }),
      h({ name: 'Cascade', hopsWeight: 28, hopsWeightUnit: 'g', hopAlphaAcid: 5.5, hopBoilMinutes: 60 }),
    ];

    it('should calculate all stats for a complete recipe', () => {
      const stats = calculateAllRecipeStats(r, ingredients);

      expect(stats.og).toBeGreaterThan(1.03);
      expect(stats.og).toBeLessThan(1.06);
      expect(stats.fg).toBeGreaterThan(1);
      expect(stats.fg).toBeLessThan(stats.og);
      expect(stats.ibu).toBeGreaterThan(10);
      expect(stats.ibu).toBeLessThan(50);
      expect(stats.srm).toBeGreaterThan(2);
      expect(stats.srm).toBeLessThan(10);
      expect(stats.abv).toBeGreaterThan(3);
      expect(stats.abv).toBeLessThan(7);
      expect(stats.calories).toBeGreaterThan(90);
    });

    it('should use default values when recipe fields are missing', () => {
      const stats = calculateAllRecipeStats(recipe(), []);
      expect(stats.og).toBe(1);
      expect(stats.fg).toBe(1);
      expect(stats.ibu).toBe(0);
      expect(stats.srm).toBe(0);
      expect(stats.abv).toBe(0);
    });

    it('should respect custom attenuation', () => {
      const stats75 = calculateAllRecipeStats(r, ingredients, 0.75);
      const stats85 = calculateAllRecipeStats(r, ingredients, 0.85);

      expect(stats85.fg).toBeLessThan(stats75.fg);
      expect(stats85.abv).toBeGreaterThan(stats75.abv);
    });

    it('should return rounded values', () => {
      const stats = calculateAllRecipeStats(r, ingredients);

      expect(stats.og).toBe(Math.round(stats.og * 1000) / 1000);
      expect(stats.fg).toBe(Math.round(stats.fg * 1000) / 1000);
      expect(stats.ibu).toBe(Math.round(stats.ibu * 10) / 10);
      expect(stats.srm).toBe(Math.round(stats.srm * 10) / 10);
      expect(stats.abv).toBe(Math.round(stats.abv * 10) / 10);
      expect(stats.calories).toBe(Math.round(stats.calories * 10) / 10);
    });
  });

  describe('getEstimatedStatsForUpdate', () => {
    const r = recipe({ batchSize: 20, efficiency: 72 });
    const ingredients = [
      g({ name: 'Pale 2-Row', grainWeight: 5, grainWeightUnit: 'kg', lovibond: 2, potentialExtract: 37, yieldPercent: 80 }),
    ];

    it('should return partial recipe with estimated stats', () => {
      const update = getEstimatedStatsForUpdate(r, ingredients);

      expect(update.estimatedOg).toBeDefined();
      expect(update.estimatedFg).toBeDefined();
      expect(update.estimatedAbv).toBeDefined();
      expect(update.estimatedIbu).toBeDefined();
      expect(update.estimatedSrm).toBeDefined();
      expect(update.estimatedCalories).toBeDefined();
    });

    it('should not include non-estimated fields', () => {
      const update = getEstimatedStatsForUpdate(r, ingredients);

      expect(update.recipeName).toBeUndefined();
      expect(update.batchSize).toBeUndefined();
      expect(update.method).toBeUndefined();
    });

    it('should produce same values as calculateAllRecipeStats', () => {
      const update = getEstimatedStatsForUpdate(r, ingredients);
      const stats = calculateAllRecipeStats(r, ingredients);

      expect(update.estimatedOg).toBe(stats.og);
      expect(update.estimatedFg).toBe(stats.fg);
      expect(update.estimatedAbv).toBe(stats.abv);
      expect(update.estimatedIbu).toBe(stats.ibu);
      expect(update.estimatedSrm).toBe(stats.srm);
      expect(update.estimatedCalories).toBe(stats.calories);
    });
  });

  describe('Real-world brewing scenarios', () => {
    it('should calculate stats for a typical American IPA', () => {
      const r = recipe({ batchSize: 19, efficiency: 75 });
      const ingredients = [
        g({ name: 'American 2-Row', grainWeight: 5.4, grainWeightUnit: 'kg', lovibond: 2, potentialExtract: 37, yieldPercent: 80 }),
        g({ name: 'Crystal 40', grainWeight: 0.45, grainWeightUnit: 'kg', lovibond: 40, potentialExtract: 34, yieldPercent: 75 }),
        h({ name: 'Centennial', hopsWeight: 28, hopsWeightUnit: 'g', hopAlphaAcid: 10, hopBoilMinutes: 60 }),
        h({ name: 'Cascade', hopsWeight: 28, hopsWeightUnit: 'g', hopAlphaAcid: 5.5, hopBoilMinutes: 15 }),
      ];

      const stats = calculateAllRecipeStats(r, ingredients, 0.73);

      expect(stats.og).toBeGreaterThan(1.05);
      expect(stats.og).toBeLessThan(1.08);
      expect(stats.ibu).toBeGreaterThan(40);
      expect(stats.ibu).toBeLessThan(80);
      expect(stats.abv).toBeGreaterThan(5);
      expect(stats.abv).toBeLessThan(8);
      expect(stats.srm).toBeGreaterThan(5);
      expect(stats.srm).toBeLessThan(15);
    });

    it('should calculate stats for a Stout', () => {
      const r = recipe({ batchSize: 20, efficiency: 70 });
      const ingredients = [
        g({ name: 'Maris Otter', grainWeight: 5, grainWeightUnit: 'kg', lovibond: 3, potentialExtract: 37, yieldPercent: 80 }),
        g({ name: 'Roasted Barley', grainWeight: 0.5, grainWeightUnit: 'kg', lovibond: 500, potentialExtract: 25, yieldPercent: 70 }),
      ];

      const stats = calculateAllRecipeStats(r, ingredients, 0.70);

      expect(stats.srm).toBeGreaterThan(20);
      expect(stats.abv).toBeGreaterThan(4);
      expect(stats.abv).toBeLessThan(6);
    });

    it('should calculate stats for a session IPA', () => {
      const r = recipe({ batchSize: 20, efficiency: 72 });
      const ingredients = [
        g({ name: 'Pale 2-Row', grainWeight: 3.5, grainWeightUnit: 'kg', lovibond: 2, potentialExtract: 37, yieldPercent: 80 }),
        h({ name: 'Citra', hopsWeight: 20, hopsWeightUnit: 'g', hopAlphaAcid: 12, hopBoilMinutes: 30 }),
      ];

      const stats = calculateAllRecipeStats(r, ingredients, 0.75);

      expect(stats.og).toBeLessThan(1.045);
      expect(stats.abv).toBeLessThan(5);
      expect(stats.ibu).toBeGreaterThan(20);
    });

    it('should calculate stats for an extract recipe', () => {
      const r = recipe({ batchSize: 20, efficiency: 100, method: 'extract' });
      const ingredients = [
        g({ name: 'Light LME', grainWeight: 3, grainWeightUnit: 'kg', lovibond: 8, potentialExtract: 36, yieldPercent: 100 }),
      ];

      const stats = calculateAllRecipeStats(r, ingredients, 0.75);

      expect(stats.og).toBeGreaterThan(1.03);
      expect(stats.og).toBeLessThan(1.06);
      expect(stats.abv).toBeGreaterThan(3);
    });
  });

  describe('Edge cases', () => {
    it('should handle very small batch size', () => {
      const fermentables = [g({ grainWeight: 0.5, grainWeightUnit: 'kg', potentialExtract: 37, yieldPercent: 80 })];
      const og = calculateOG(fermentables, 0.72, 1);
      expect(og).toBeGreaterThan(1);
      expect(og).toBeLessThan(1.2);
    });

    it('should handle very large batch size', () => {
      const fermentables = [g({ grainWeight: 500, grainWeightUnit: 'kg', potentialExtract: 37, yieldPercent: 80 })];
      const og = calculateOG(fermentables, 0.72, 2000);
      expect(og).toBeGreaterThan(1.03);
      expect(og).toBeLessThan(1.08);
    });

    it('should handle 0 efficiency', () => {
      const fermentables = [g({ grainWeight: 5, grainWeightUnit: 'kg', potentialExtract: 37, yieldPercent: 80 })];
      expect(calculateOG(fermentables, 0, 20)).toBe(1);
    });

    it('should handle 100% efficiency', () => {
      const fermentables = [g({ grainWeight: 5, grainWeightUnit: 'kg', potentialExtract: 37, yieldPercent: 80 })];
      expect(calculateOG(fermentables, 1, 20)).toBeGreaterThan(1.05);
    });

    it('should handle grain without yieldPercent', () => {
      const fermentables = [g({ grainWeight: 5, grainWeightUnit: 'kg', potentialExtract: 37 })];
      expect(calculateOG(fermentables, 0.72, 20)).toBeGreaterThan(1);
    });

    it('should handle grain without grainWeightUnit (defaults to kg)', () => {
      const fermentables = [g({ grainWeight: 5, potentialExtract: 37, yieldPercent: 80 })];
      expect(calculateOG(fermentables, 0.72, 20)).toBeGreaterThan(1);
    });
  });
});
