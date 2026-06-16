import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { Types } from 'mongoose';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import Recipe from '../models/Recipe';
import RecipeIngredient from '../models/RecipeIngredient';
import Rating from '../models/Rating';
import Comment from '../models/Comment';
import { parseBeerXML, exportToBeerXML } from '../services/BeerXMLParser';

export const recipeRouter = Router();

const createRecipeValidation = [
  body('recipeName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Recipe name must be between 1 and 100 characters'),
  body('style')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Style must be at most 100 characters'),
  body('styleCode')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Style code must be at most 10 characters'),
  body('method')
    .optional()
    .isIn(['all_grain', 'partial_mash', 'extract', 'biab'])
    .withMessage('Method must be all_grain, partial_mash, extract, or biab'),
  body('batchSize')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Batch size cannot be negative'),
  body('batchSizeUnit')
    .optional()
    .isIn(['L', 'gal', 'bbl'])
    .withMessage('Batch size unit must be L, gal, or bbl'),
  body('boilTimeMinutes')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Boil time cannot be negative'),
  body('efficiency')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Efficiency must be between 0 and 100'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('notes')
    .optional()
    .trim()
    .isString()
    .withMessage('Notes must be a string'),
];

const updateRecipeValidation = [
  body('recipeName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Recipe name must be between 1 and 100 characters'),
  body('style')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Style must be at most 100 characters'),
  body('styleCode')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Style code must be at most 10 characters'),
  body('method')
    .optional()
    .isIn(['all_grain', 'partial_mash', 'extract', 'biab'])
    .withMessage('Method must be all_grain, partial_mash, extract, or biab'),
  body('batchSize')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Batch size cannot be negative'),
  body('batchSizeUnit')
    .optional()
    .isIn(['L', 'gal', 'bbl'])
    .withMessage('Batch size unit must be L, gal, or bbl'),
  body('boilTimeMinutes')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Boil time cannot be negative'),
  body('efficiency')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Efficiency must be between 0 and 100'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('notes')
    .optional()
    .trim()
    .isString()
    .withMessage('Notes must be a string'),
];

recipeRouter.get('/', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const sortField = (req.query.sort as string) || 'createdAt';
    const sortOrder = (req.query.order as string) === 'asc' ? 1 : -1;
    const search = (req.query.search as string) || '';
    const style = (req.query.style as string) || '';

    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { userId, isArchived: false };

    if (style) {
      filter.style = style;
    }

    if (search) {
      // Escape regex special characters to prevent ReDoS injection
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.recipeName = { $regex: escaped, $options: 'i' };
    }

    const sortOptions: Record<string, 1 | -1> = { [sortField]: sortOrder };

    const recipes = await Recipe.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Recipe.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    throw error;
  }
});

recipeRouter.post(
  '/',
  auth,
  validate(createRecipeValidation),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!._id;
      const {
        recipeName,
        style,
        styleCode,
        method,
        batchSize,
        batchSizeUnit,
        boilTimeMinutes,
        efficiency,
        isPublic,
        notes,
      } = req.body;

      const recipe = new Recipe({
        userId,
        recipeName,
        style,
        styleCode,
        method,
        batchSize,
        batchSizeUnit,
        boilTimeMinutes,
        efficiency,
        isPublic,
        notes,
      });

      await recipe.save();

      res.status(201).json({ recipe });
    } catch (error) {
      throw error;
    }
  }
);

// Rating endpoints
recipeRouter.post(
  '/:id/rate',
  auth,
  [body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')],
  validate([body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')]),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!._id;
      const { rating } = req.body;

      const recipe = await Recipe.findById(id);
      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      // Upsert rating
      const existingRating = await Rating.findOne({ recipeId: id, userId });
      if (existingRating) {
        existingRating.rating = rating;
        await existingRating.save();
      } else {
        await Rating.create({ recipeId: id, userId, rating });
      }

      // Recalculate averages
      const stats = await Rating.aggregate([
        { $match: { recipeId: recipe._id } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            ratingCount: { $sum: 1 },
          },
        },
      ]);

      const averageRating = stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0;
      const ratingCount = stats.length > 0 ? stats[0].ratingCount : 0;

      // Update recipe
      recipe.averageRating = averageRating;
      recipe.ratingCount = ratingCount;
      await recipe.save();

      res.status(200).json({ rating, averageRating, ratingCount });
    } catch (error) {
      throw error;
    }
  }
);

recipeRouter.get('/:id/ratings', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const recipe = await Recipe.findById(id).lean();
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    let userRating = null;
    if (userId) {
      const rating = await Rating.findOne({ recipeId: id, userId }).lean();
      userRating = rating ? rating.rating : null;
    }

    res.status(200).json({
      averageRating: recipe.averageRating || 0,
      ratingCount: recipe.ratingCount || 0,
      userRating,
    });
  } catch (error) {
    throw error;
  }
});

// Comment endpoints
recipeRouter.post(
  '/:id/comments',
  auth,
  [body('text').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')],
  validate([body('text').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')]),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!._id;
      const { text } = req.body;

      const recipe = await Recipe.findById(id);
      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      const comment = await Comment.create({ recipeId: id, userId, text });

      // Populate user info
      const populatedComment = await Comment.findById(comment._id)
        .populate('userId', 'username')
        .lean();

      res.status(201).json({ comment: populatedComment });
    } catch (error) {
      throw error;
    }
  }
);

recipeRouter.get('/:id/comments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id).lean();
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const comments = await Comment.find({ recipeId: id })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ comments });
  } catch (error) {
    throw error;
  }
});

recipeRouter.delete('/:id/comments/:commentId', auth, async (req: Request, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user!._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.recipeId.toString() !== id) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    throw error;
  }
});

// Community endpoints (public)
recipeRouter.get('/community', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 12));
    const search = (req.query.search as string) || '';
    const style = (req.query.style as string) || '';
    const sort = (req.query.sort as string) || 'rating';

    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { isPublic: true, isArchived: false };

    if (style) {
      filter.style = style;
    }

    if (search) {
      // Escape regex special characters to prevent ReDoS injection
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.recipeName = { $regex: escaped, $options: 'i' };
    }

    let sortOptions: Record<string, 1 | -1> = {};
    switch (sort) {
      case 'rating':
        sortOptions = { averageRating: -1, ratingCount: -1 };
        break;
      case 'popular':
        sortOptions = { ratingCount: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      default:
        sortOptions = { averageRating: -1, ratingCount: -1 };
    }

    const recipes = await Recipe.find(filter)
      .populate('userId', 'username')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Recipe.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    throw error;
  }
});

recipeRouter.get('/community/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id)
      .populate('userId', 'username')
      .lean();

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (!recipe.isPublic) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Get comments
    const comments = await Comment.find({ recipeId: id })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ recipe, comments });
  } catch (error) {
    throw error;
  }
});

// BeerXML Import endpoint
recipeRouter.post(
  '/import',
  auth,
  [body('xml').trim().isLength({ min: 1 }).withMessage('XML content is required')],
  validate([body('xml').trim().isLength({ min: 1 }).withMessage('XML content is required')]),
  async (req: Request, res: Response) => {
    try {
      const { xml } = req.body;

      // Sentinel: file size check at app level
      if (xml.length > 1_048_576) {
        return res.status(413).json({ error: 'XML file too large. Maximum size is 1MB.' });
      }

      const parsed = await parseBeerXML(xml);

      // Return parsed recipe for preview (not saved yet)
      res.status(200).json({
        recipe: parsed.recipe,
        hops: parsed.hops,
        fermentables: parsed.fermentables,
        yeasts: parsed.yeasts,
        mashProfile: parsed.mashProfile,
        styleProfile: parsed.styleProfile,
        equipment: parsed.equipment,
        instructions: parsed.instructions,
        miscIngredients: parsed.miscIngredients,
      });
    } catch (error: any) {
      const message = error.message || 'Failed to parse BeerXML';
      if (message.includes('security') || message.includes('Malformed')) {
        return res.status(400).json({ error: message });
      }
      return res.status(422).json({ error: message });
    }
  }
);

// BeerXML Import Confirm — saves the previewed recipe
recipeRouter.post(
  '/import/confirm',
  auth,
  [
    body('recipe').isObject().withMessage('Recipe data is required'),
    body('recipe.recipeName').trim().isLength({ min: 1, max: 100 }).withMessage('Recipe name is required'),
  ],
  validate([
    body('recipe').isObject().withMessage('Recipe data is required'),
    body('recipe.recipeName').trim().isLength({ min: 1, max: 100 }).withMessage('Recipe name is required'),
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!._id;
      const { recipe: recipeData } = req.body;

      const recipe = new Recipe({
        userId,
        recipeName: recipeData.recipeName,
        style: recipeData.style,
        styleCode: recipeData.styleCode,
        method: recipeData.method || 'all_grain',
        batchSize: recipeData.batchSize,
        batchSizeUnit: recipeData.batchSizeUnit || 'L',
        boilSize: recipeData.boilSize,
        preBoilSize: recipeData.preBoilSize,
        boilTimeMinutes: recipeData.boilTimeMinutes,
        efficiency: recipeData.efficiency,
        notes: recipeData.notes,
        tasteNotes: recipeData.tasteNotes,
        tasteRating: recipeData.tasteRating,
        estimatedOg: recipeData.estimatedOg,
        estimatedFg: recipeData.estimatedFg,
        estimatedAbv: recipeData.estimatedAbv,
        estimatedIbu: recipeData.estimatedIbu,
        estimatedSrm: recipeData.estimatedSrm,
        brewer: recipeData.brewer,
        asstBrewer: recipeData.asstBrewer,
        brewDate: recipeData.brewDate,
        mashProfile: recipeData.mashProfile,
        styleProfile: recipeData.styleProfile,
        equipment: recipeData.equipment,
        instructions: recipeData.instructions,
        miscIngredients: recipeData.miscIngredients,
        carbonation: recipeData.carbonation,
        forcedCarbonation: recipeData.forcedCarbonation,
        primingSugarName: recipeData.primingSugarName,
        primingSugarEquiv: recipeData.primingSugarEquiv,
        kegPrimingFactor: recipeData.kegPrimingFactor,
        carbonationTemp: recipeData.carbonationTemp,
        primaryAgeDays: recipeData.primaryAgeDays,
        primaryTemp: recipeData.primaryTemp,
        secondaryAgeDays: recipeData.secondaryAgeDays,
        secondaryTemp: recipeData.secondaryTemp,
        tertiaryAgeDays: recipeData.tertiaryAgeDays,
        tertiaryTemp: recipeData.tertiaryTemp,
        ageDays: recipeData.ageDays,
        ageTemp: recipeData.ageTemp,
      });

      await recipe.save();

      // Create RecipeIngredient records for hops (with all fields)
      const hops = recipeData.hops || [];
      const hopIngredients = hops.map((h: any, idx: number) => ({
        recipeId: recipe._id,
        ingredientType: 'hops' as const,
        order: idx + 1,
        name: h.name,
        hopsWeight: h.amount ? h.amount * 1000 : undefined, // Convert kg to g
        hopsWeightUnit: 'g' as const,
        hopAlphaAcid: h.alpha,
        hopBoilMinutes: h.time,
        hopForm: h.form?.toLowerCase()?.includes('pellet') ? 'pellet' as const : 'whole_leaf' as const,
        hopAdditionTime: h.use,
        hopOrigin: h.origin,
        hopType: h.type,
        hopNotes: h.notes,
        hopBetaAcid: h.beta,
        hopHsi: h.hsi,
        hopHumulene: h.humulene,
        hopCaryophyllene: h.caryophyllene,
        hopCohumulone: h.cohumulone,
        hopMyrcene: h.myrcene,
        hopSubstitutes: h.substitutes,
        hopProducer: h.producer,
        hopProductId: h.productId,
        hopYear: h.year,
      }));

      // Create RecipeIngredient records for fermentables (with all fields)
      const fermentables = recipeData.fermentables || [];
      const fermIngredients = fermentables.map((f: any, idx: number) => ({
        recipeId: recipe._id,
        ingredientType: 'grain' as const,
        order: hops.length + idx + 1,
        name: f.name,
        grainWeight: f.amount,
        grainWeightUnit: 'kg' as const,
        lovibond: f.color,
        potentialExtract: f.potentialExtract || f.yield,
        yieldPercent: f.yield,
        grainType: f.type,
        origin: f.origin,
        supplier: f.supplier,
        grainNotes: f.notes,
        coarseFineDiff: f.coarseFineDiff,
        moisture: f.moisture,
        protein: f.protein,
        maxInBatch: f.maxInBatch,
        recommendMash: f.recommendMash,
        ibuGalPerLb: f.ibuGalPerLb,
      }));

      // Create RecipeIngredient records for yeast (with all fields)
      const yeasts = recipeData.yeasts || [];
      const yeastIngredients = yeasts.map((y: any, idx: number) => ({
        recipeId: recipe._id,
        ingredientType: 'yeast' as const,
        order: hops.length + fermentables.length + idx + 1,
        name: y.name,
        yeastType: y.type,
        yeastForm: y.form,
        laboratory: y.laboratory,
        strainId: y.productId,
        yeastAmount: y.amount,
        yeastFlocculation: y.flocculation,
        yeastAttenuationMin: y.attenuationMin,
        yeastAttenuationMax: y.attenuationMax,
        yeastMinTemperature: y.minTemperature,
        yeastMaxTemperature: y.maxTemperature,
        yeastTimesCultured: y.timesCultured,
        yeastMaxReuse: y.maxReuse,
        yeastAddToSecondary: y.addToSecondary,
        yeastBestFor: y.bestFor,
        yeastNotes: y.notes,
      }));

      // Create RecipeIngredient records for misc ingredients
      const miscs = recipeData.miscIngredients || [];
      const miscIngredientsList = miscs.map((m: any, idx: number) => ({
        recipeId: recipe._id,
        ingredientType: 'misc' as const,
        order: hops.length + fermentables.length + yeasts.length + idx + 1,
        name: m.name,
        miscType: m.type,
        miscUse: m.use,
        miscUseFor: m.useFor,
        miscAmountIsWeight: m.amountIsWeight,
        miscTime: m.time,
        miscNotes: m.notes,
      }));

      // Save all ingredients
      const allIngredients = [...hopIngredients, ...fermIngredients, ...yeastIngredients, ...miscIngredientsList];
      if (allIngredients.length > 0) {
        await RecipeIngredient.insertMany(allIngredients);
      }

      res.status(201).json({ recipe });
    } catch (error) {
      throw error;
    }
  }
);

// Get ingredients for a recipe
recipeRouter.get('/:id/ingredients', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    // Validate ObjectId format to prevent BSON crash
    if (!Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const recipe = await Recipe.findById(id).lean();
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const isOwner = recipe.userId.toString() === userId.toString();
    const isPublic = recipe.isPublic;
    if (!isOwner && !isPublic) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const ingredients = await RecipeIngredient.find({ recipeId: id }).sort({ order: 1 }).lean();
    res.json({ ingredients });
  } catch (error) {
    throw error;
  }
});

// Clone Recipe — copy a community recipe into your own recipe list
recipeRouter.post(
  '/:id/clone',
  auth,
  [body('recipeName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Recipe name must be at most 100 characters')],
  validate([body('recipeName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Recipe name must be at most 100 characters')]),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!._id;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      const source = await Recipe.findById(id).lean();
      if (!source) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      if (!source.isPublic && source.userId.toString() !== userId.toString()) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      const newRecipeName = req.body.recipeName || `${source.recipeName} (Clone)`;

      // Create the new recipe (private, owned by current user)
      const clonedData: Record<string, any> = {
        userId,
        recipeName: newRecipeName,
        style: source.style,
        styleCode: source.styleCode,
        version: 1,
        isTemplate: false,
        isPublic: false,
        isArchived: false,
        method: source.method,
        batchSize: source.batchSize,
        batchSizeUnit: source.batchSizeUnit,
        boilSize: source.boilSize,
        preBoilSize: source.preBoilSize,
        boilTimeMinutes: source.boilTimeMinutes,
        efficiency: source.efficiency,
        estimatedOg: source.estimatedOg,
        estimatedFg: source.estimatedFg,
        estimatedAbv: source.estimatedAbv,
        estimatedIbu: source.estimatedIbu,
        estimatedSrm: source.estimatedSrm,
        estimatedCalories: source.estimatedCalories,
        notes: source.notes,
        tasteNotes: source.tasteNotes,
        brewer: req.user!.username || req.user!.email,
        asstBrewer: source.asstBrewer,
        mashProfile: source.mashProfile,
        styleProfile: source.styleProfile,
        equipment: source.equipment,
        instructions: source.instructions,
        miscIngredients: source.miscIngredients,
        carbonation: source.carbonation,
        forcedCarbonation: source.forcedCarbonation,
        primingSugarName: source.primingSugarName,
        primingSugarEquiv: source.primingSugarEquiv,
        kegPrimingFactor: source.kegPrimingFactor,
        carbonationTemp: source.carbonationTemp,
        primaryAgeDays: source.primaryAgeDays,
        primaryTemp: source.primaryTemp,
        secondaryAgeDays: source.secondaryAgeDays,
        secondaryTemp: source.secondaryTemp,
        tertiaryAgeDays: source.tertiaryAgeDays,
        tertiaryTemp: source.tertiaryTemp,
        ageDays: source.ageDays,
        ageTemp: source.ageTemp,
      };

      const newRecipe = new Recipe(clonedData);
      await newRecipe.save();

      // Clone RecipeIngredient documents
      const sourceIngredients = await RecipeIngredient.find({ recipeId: id }).lean();
      if (sourceIngredients.length > 0) {
        const clonedIngredients = sourceIngredients.map((ing) => {
          const { _id, recipeId, createdAt, updatedAt, __v, ...rest } = ing;
          return { ...rest, recipeId: newRecipe._id };
        });
        await RecipeIngredient.insertMany(clonedIngredients);
      }

      res.status(201).json({ recipe: newRecipe });
    } catch (error) {
      throw error;
    }
  }
);

// BeerXML Export endpoint
recipeRouter.get('/:id/export', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const recipe = await Recipe.findById(id).lean();

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const isOwner = recipe.userId.toString() === userId.toString();
    const isPublic = recipe.isPublic;

    if (!isOwner && !isPublic) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const xml = exportToBeerXML(recipe);

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="${recipe.recipeName.replace(/[^a-zA-Z0-9]/g, '_')}.xml"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200).send(xml);
  } catch (error) {
    throw error;
  }
});

recipeRouter.get('/:id', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const recipe = await Recipe.findById(id).lean();

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const isOwner = recipe.userId.toString() === userId.toString();
    const isPublic = recipe.isPublic;

    if (!isOwner && !isPublic) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.status(200).json({ recipe });
  } catch (error) {
    throw error;
  }
});

recipeRouter.put(
  '/:id',
  auth,
  validate(updateRecipeValidation),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!._id;

      const recipe = await Recipe.findById(id);

      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      if (recipe.userId.toString() !== userId.toString()) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      // Whitelist allowed fields to prevent mass assignment
      const allowedFields = [
        'recipeName', 'style', 'styleCode', 'method', 'batchSize', 'batchSizeUnit',
        'boilTimeMinutes', 'efficiency', 'isPublic', 'notes',
        'styleProfile', 'equipment', 'mashProfile', 'miscIngredients',
        'carbonation', 'forcedCarbonation', 'primingSugarName',
        'brewer', 'asstBrewer', 'brewDate',
      ];
      const sanitized: Record<string, any> = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          sanitized[field] = req.body[field];
        }
      }
      Object.assign(recipe, sanitized);

      await recipe.save();

      res.status(200).json({ recipe });
    } catch (error) {
      throw error;
    }
  }
);

recipeRouter.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe.userId.toString() !== userId.toString()) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    recipe.isArchived = true;
    await recipe.save();

    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    throw error;
  }
});
