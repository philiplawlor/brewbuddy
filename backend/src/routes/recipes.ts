import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import Recipe from '../models/Recipe';

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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) || '-createdAt';

    const skip = (page - 1) * limit;

    const recipes = await Recipe.find({ userId, isArchived: false })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Recipe.countDocuments({ userId, isArchived: false });
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

      const updatedFields = req.body;
      Object.assign(recipe, updatedFields);

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
