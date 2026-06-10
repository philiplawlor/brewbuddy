import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Recipe from '../src/models/Recipe';
import RecipeIngredient from '../src/models/RecipeIngredient';
import User from '../src/models/User';

let mongoServer: MongoMemoryServer;
let userId: mongoose.Types.ObjectId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoURI = mongoServer.getUri();
  await mongoose.connect(mongoURI);

  const user = await new User({
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'password123',
    displayName: 'Test User',
  }).save();
  userId = user._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Recipe.deleteMany({});
  await RecipeIngredient.deleteMany({});
});

describe('Recipe Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid recipe', async () => {
      const recipeData = {
        userId,
        recipeName: 'My IPA',
        method: 'all_grain' as const,
        style: 'American IPA',
        styleCode: '21A',
      };

      const recipe = new Recipe(recipeData);
      const savedRecipe = await recipe.save();

      expect(savedRecipe).toBeDefined();
      expect(savedRecipe._id).toBeDefined();
      expect(savedRecipe.recipeName).toBe('My IPA');
      expect(savedRecipe.method).toBe('all_grain');
      expect(savedRecipe.style).toBe('American IPA');
      expect(savedRecipe.styleCode).toBe('21A');
    });

    it('should require recipeName', async () => {
      const recipeData = {
        userId,
        method: 'all_grain' as const,
      };

      const recipe = new Recipe(recipeData);

      await expect(recipe.save()).rejects.toThrow('Recipe name is required');
    });

    it('should require userId', async () => {
      const recipeData = {
        recipeName: 'My IPA',
        method: 'all_grain' as const,
      };

      const recipe = new Recipe(recipeData);

      await expect(recipe.save()).rejects.toThrow('User ID is required');
    });

    it('should enforce recipeName maxlength', async () => {
      const recipeData = {
        userId,
        recipeName: 'a'.repeat(101),
        method: 'all_grain' as const,
      };

      const recipe = new Recipe(recipeData);

      await expect(recipe.save()).rejects.toThrow(
        'Recipe name must be at most 100 characters'
      );
    });

    it('should accept valid method values', async () => {
      const methods = ['all_grain', 'partial_mash', 'extract', 'biab'];

      for (const method of methods) {
        const recipeData = {
          userId,
          recipeName: `Recipe ${method}`,
          method: method as 'all_grain' | 'partial_mash' | 'extract' | 'biab',
        };

        const recipe = new Recipe(recipeData);
        const savedRecipe = await recipe.save();

        expect(savedRecipe.method).toBe(method);
      }
    });

    it('should reject invalid method', async () => {
      const recipeData = {
        userId,
        recipeName: 'My IPA',
        method: 'invalid_method',
      };

      const recipe = new Recipe(recipeData as any);

      await expect(recipe.save()).rejects.toThrow();
    });

    it('should default version to 1', async () => {
      const recipeData = {
        userId,
        recipeName: 'My IPA',
        method: 'all_grain' as const,
      };

      const recipe = new Recipe(recipeData);
      const savedRecipe = await recipe.save();

      expect(savedRecipe.version).toBe(1);
    });

    it('should default isTemplate to false', async () => {
      const recipeData = {
        userId,
        recipeName: 'My IPA',
        method: 'all_grain' as const,
      };

      const recipe = new Recipe(recipeData);
      const savedRecipe = await recipe.save();

      expect(savedRecipe.isTemplate).toBe(false);
    });

    it('should default isPublic to false', async () => {
      const recipeData = {
        userId,
        recipeName: 'My IPA',
        method: 'all_grain' as const,
      };

      const recipe = new Recipe(recipeData);
      const savedRecipe = await recipe.save();

      expect(savedRecipe.isPublic).toBe(false);
    });

    it('should default isArchived to false', async () => {
      const recipeData = {
        userId,
        recipeName: 'My IPA',
        method: 'all_grain' as const,
      };

      const recipe = new Recipe(recipeData);
      const savedRecipe = await recipe.save();

      expect(savedRecipe.isArchived).toBe(false);
    });

    it('should validate efficiency range 0-100', async () => {
      const recipeData = {
        userId,
        recipeName: 'My IPA',
        method: 'all_grain' as const,
        efficiency: 101,
      };

      const recipe = new Recipe(recipeData);

      await expect(recipe.save()).rejects.toThrow(
        'Efficiency must be between 0 and 100'
      );
    });

    it('should validate tasteRating range 0-50', async () => {
      const recipeData = {
        userId,
        recipeName: 'My IPA',
        method: 'all_grain' as const,
        tasteRating: 51,
      };

      const recipe = new Recipe(recipeData);

      await expect(recipe.save()).rejects.toThrow(
        'Taste rating must be between 0 and 50'
      );
    });

    it('should set createdAt and updatedAt timestamps', async () => {
      const recipeData = {
        userId,
        recipeName: 'My IPA',
        method: 'all_grain' as const,
      };

      const recipe = new Recipe(recipeData);
      const savedRecipe = await recipe.save();

      expect(savedRecipe.createdAt).toBeDefined();
      expect(savedRecipe.updatedAt).toBeDefined();
      expect(savedRecipe.createdAt).toBeInstanceOf(Date);
      expect(savedRecipe.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Mash Profile', () => {
    it('should create recipe with mash profile', async () => {
      const recipeData = {
        userId,
        recipeName: 'My IPA',
        method: 'all_grain' as const,
        mashProfile: {
          name: 'Single Infusion',
          grainTemp: 20,
          tunTemp: 22,
          spargeTemp: 76,
          ph: 5.4,
          steps: [
            {
              name: 'Mash In',
              type: 'infusion' as const,
              infuseAmount: 15,
              stepTemp: 67,
              stepTime: 60,
            },
            {
              name: 'Mash Out',
              type: 'infusion' as const,
              infuseAmount: 5,
              stepTemp: 76,
              stepTime: 10,
            },
          ],
        },
      };

      const recipe = new Recipe(recipeData);
      const savedRecipe = await recipe.save();

      expect(savedRecipe.mashProfile).toBeDefined();
      expect(savedRecipe.mashProfile?.name).toBe('Single Infusion');
      expect(savedRecipe.mashProfile?.grainTemp).toBe(20);
      expect(savedRecipe.mashProfile?.steps).toHaveLength(2);
      expect(savedRecipe.mashProfile?.steps[0].type).toBe('infusion');
    });
  });

  describe('Fermentation Profile', () => {
    it('should create recipe with fermentation profile', async () => {
      const recipeData = {
        userId,
        recipeName: 'My IPA',
        method: 'all_grain' as const,
        fermentationProfile: {
          name: 'Standard Ale',
          stages: [
            {
              name: 'Primary',
              targetTemp: 19,
              durationDays: 14,
              notes: 'Let it ferment',
            },
            {
              name: 'Secondary',
              targetTemp: 4,
              durationDays: 7,
              notes: 'Cold crash',
            },
          ],
        },
      };

      const recipe = new Recipe(recipeData);
      const savedRecipe = await recipe.save();

      expect(savedRecipe.fermentationProfile).toBeDefined();
      expect(savedRecipe.fermentationProfile?.name).toBe('Standard Ale');
      expect(savedRecipe.fermentationProfile?.stages).toHaveLength(2);
      expect(savedRecipe.fermentationProfile?.stages[0].targetTemp).toBe(19);
      expect(savedRecipe.fermentationProfile?.stages[1].durationDays).toBe(7);
    });
  });
});

describe('RecipeIngredient Model', () => {
  let recipeId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const recipe = await new Recipe({
      userId,
      recipeName: 'Test Recipe',
      method: 'all_grain',
    }).save();
    recipeId = recipe._id;
  });

  describe('Schema Validation', () => {
    it('should create a valid grain ingredient', async () => {
      const ingredientData = {
        recipeId,
        ingredientType: 'grain' as const,
        order: 1,
        name: 'Pale 2-Row',
        category: 'base_malt',
        grainWeight: 5,
        grainWeightUnit: 'lb' as const,
        lovibond: 2,
        potentialExtract: 37,
        yieldPercent: 80,
      };

      const ingredient = new RecipeIngredient(ingredientData);
      const savedIngredient = await ingredient.save();

      expect(savedIngredient).toBeDefined();
      expect(savedIngredient._id).toBeDefined();
      expect(savedIngredient.name).toBe('Pale 2-Row');
      expect(savedIngredient.ingredientType).toBe('grain');
      expect(savedIngredient.grainWeight).toBe(5);
    });

    it('should create a valid hops ingredient', async () => {
      const ingredientData = {
        recipeId,
        ingredientType: 'hops' as const,
        order: 2,
        name: 'Cascade',
        hopsWeight: 28,
        hopsWeightUnit: 'g' as const,
        hopAdditionTime: '60 min',
        hopAlphaAcid: 5.5,
        hopBoilMinutes: 60,
        hopForm: 'pellet' as const,
      };

      const ingredient = new RecipeIngredient(ingredientData);
      const savedIngredient = await ingredient.save();

      expect(savedIngredient).toBeDefined();
      expect(savedIngredient.name).toBe('Cascade');
      expect(savedIngredient.ingredientType).toBe('hops');
      expect(savedIngredient.hopsWeight).toBe(28);
      expect(savedIngredient.hopForm).toBe('pellet');
    });

    it('should create a valid yeast ingredient', async () => {
      const ingredientData = {
        recipeId,
        ingredientType: 'yeast' as const,
        order: 3,
        name: 'Safale US-05',
        yeastPackageCount: 1,
        yeastStarterSizeMl: 500,
        yeastCellCount: 200,
        yeastType: 'ale',
        yeastForm: 'dry',
        strainId: 'US-05',
        laboratory: 'Fermentis',
      };

      const ingredient = new RecipeIngredient(ingredientData);
      const savedIngredient = await ingredient.save();

      expect(savedIngredient).toBeDefined();
      expect(savedIngredient.name).toBe('Safale US-05');
      expect(savedIngredient.ingredientType).toBe('yeast');
      expect(savedIngredient.yeastPackageCount).toBe(1);
      expect(savedIngredient.laboratory).toBe('Fermentis');
    });

    it('should require recipeId', async () => {
      const ingredientData = {
        ingredientType: 'grain' as const,
        order: 1,
        name: 'Pale 2-Row',
      };

      const ingredient = new RecipeIngredient(ingredientData);

      await expect(ingredient.save()).rejects.toThrow('Recipe ID is required');
    });

    it('should require ingredientType', async () => {
      const ingredientData = {
        recipeId,
        order: 1,
        name: 'Pale 2-Row',
      };

      const ingredient = new RecipeIngredient(ingredientData);

      await expect(ingredient.save()).rejects.toThrow(
        'Ingredient type is required'
      );
    });

    it('should reject invalid ingredientType', async () => {
      const ingredientData = {
        recipeId,
        ingredientType: 'invalid',
        order: 1,
        name: 'Pale 2-Row',
      };

      const ingredient = new RecipeIngredient(ingredientData as any);

      await expect(ingredient.save()).rejects.toThrow();
    });

    it('should accept valid ingredientType values', async () => {
      const types = ['grain', 'hops', 'yeast', 'adjunct', 'chemical'];

      for (const type of types) {
        const ingredientData = {
          recipeId,
          ingredientType: type as 'grain' | 'hops' | 'yeast' | 'adjunct' | 'chemical',
          order: 1,
          name: `Test ${type}`,
        };

        const ingredient = new RecipeIngredient(ingredientData);
        const savedIngredient = await ingredient.save();

        expect(savedIngredient.ingredientType).toBe(type);
      }
    });

    it('should default order to 0', async () => {
      const ingredientData = {
        recipeId,
        ingredientType: 'grain' as const,
        name: 'Pale 2-Row',
      };

      const ingredient = new RecipeIngredient(ingredientData);
      const savedIngredient = await ingredient.save();

      expect(savedIngredient.order).toBe(0);
    });

    it('should set createdAt and updatedAt timestamps', async () => {
      const ingredientData = {
        recipeId,
        ingredientType: 'grain' as const,
        order: 1,
        name: 'Pale 2-Row',
      };

      const ingredient = new RecipeIngredient(ingredientData);
      const savedIngredient = await ingredient.save();

      expect(savedIngredient.createdAt).toBeDefined();
      expect(savedIngredient.updatedAt).toBeDefined();
      expect(savedIngredient.createdAt).toBeInstanceOf(Date);
      expect(savedIngredient.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Index Queries', () => {
    it('should find ingredients by recipeId', async () => {
      await RecipeIngredient.create([
        {
          recipeId,
          ingredientType: 'grain',
          order: 1,
          name: 'Pale 2-Row',
        },
        {
          recipeId,
          ingredientType: 'hops',
          order: 2,
          name: 'Cascade',
        },
      ]);

      const ingredients = await RecipeIngredient.find({ recipeId });
      expect(ingredients).toHaveLength(2);
    });

    it('should find ingredients by ingredientType', async () => {
      await RecipeIngredient.create([
        {
          recipeId,
          ingredientType: 'grain',
          order: 1,
          name: 'Pale 2-Row',
        },
        {
          recipeId,
          ingredientType: 'hops',
          order: 2,
          name: 'Cascade',
        },
        {
          recipeId,
          ingredientType: 'hops',
          order: 3,
          name: 'Centennial',
        },
      ]);

      const hops = await RecipeIngredient.find({
        recipeId,
        ingredientType: 'hops',
      });
      expect(hops).toHaveLength(2);
    });
  });
});
