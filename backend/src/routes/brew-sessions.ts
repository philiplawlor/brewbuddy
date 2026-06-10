import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { auth } from '../middleware/auth';
import BrewSession from '../models/BrewSession';
import SessionEvent from '../models/SessionEvent';

export const brewSessionRouter = Router();

const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const validation of validations) {
      await validation.run(req);
    }
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    return res.status(400).json({ message: errors.array()[0].msg });
  };
};

const createBrewSessionValidation = [
  body('recipeId')
    .notEmpty()
    .withMessage('Recipe ID is required')
    .isMongoId()
    .withMessage('Recipe ID must be a valid MongoDB ID'),
  body('sessionName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Session name must be at most 200 characters'),
  body('brewDate')
    .optional()
    .isISO8601()
    .withMessage('Brew date must be a valid date'),
  body('batchNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Batch number must be at most 50 characters'),
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
  body('notes')
    .optional()
    .trim()
    .isString()
    .withMessage('Notes must be a string'),
];

const updateBrewSessionValidation = [
  body('sessionName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Session name must be at most 200 characters'),
  body('status')
    .optional()
    .isIn(['planned', 'in_progress', 'fermenting', 'conditioning', 'bottled', 'consumed'])
    .withMessage('Status must be a valid status'),
  body('batchNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Batch number must be at most 50 characters'),
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
  body('actualOg')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual OG cannot be negative'),
  body('actualFg')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual FG cannot be negative'),
  body('actualAbv')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual ABV cannot be negative'),
  body('actualIbu')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual IBU cannot be negative'),
  body('actualSrm')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual SRM cannot be negative'),
  body('brewDurationMinutes')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Brew duration cannot be negative'),
  body('fermentationDays')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fermentation days cannot be negative'),
  body('conditioningDays')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Conditioning days cannot be negative'),
  body('ambientTemperature')
    .optional()
    .isFloat()
    .withMessage('Ambient temperature must be a number'),
  body('humidity')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Humidity must be between 0 and 100'),
  body('totalCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total cost cannot be negative'),
  body('notes')
    .optional()
    .trim()
    .isString()
    .withMessage('Notes must be a string'),
];

const createEventValidation = [
  body('eventType')
    .notEmpty()
    .withMessage('Event type is required')
    .isIn([
      'mash_in',
      'mash_step',
      'mash_out',
      'vorlauf',
      'sparge',
      'boil_start',
      'hop_addition',
      'whirlpool',
      'flameout',
      'chill',
      'pitch_yeast',
      'transfer',
    ])
    .withMessage('Event type must be a valid brew day event'),
  body('temperature')
    .optional()
    .isFloat()
    .withMessage('Temperature must be a number'),
  body('gravityReading')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Gravity reading cannot be negative'),
  body('notes')
    .optional()
    .trim()
    .isString()
    .withMessage('Notes must be a string'),
  body('durationMinutes')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Duration cannot be negative'),
  body('hopName')
    .optional()
    .trim()
    .isString()
    .withMessage('Hop name must be a string'),
  body('hopWeight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hop weight cannot be negative'),
  body('hopWeightUnit')
    .optional()
    .isIn(['g', 'oz', 'lb'])
    .withMessage('Hop weight unit must be g, oz, or lb'),
  body('hopAlphaAcid')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Alpha acid must be between 0 and 100'),
  body('hopBoilMinutes')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hop boil minutes cannot be negative'),
  body('mashStepName')
    .optional()
    .trim()
    .isString()
    .withMessage('Mash step name must be a string'),
  body('targetTemp')
    .optional()
    .isFloat()
    .withMessage('Target temperature must be a number'),
  body('actualTemp')
    .optional()
    .isFloat()
    .withMessage('Actual temperature must be a number'),
];

// Create brew session
brewSessionRouter.post(
  '/',
  auth,
  validate(createBrewSessionValidation),
  async (req: Request, res: Response) => {
    try {
      const { recipeId, sessionName, brewDate, batchNumber, method, batchSize, batchSizeUnit, notes } = req.body;

      const session = new BrewSession({
        userId: req.user!._id,
        recipeId,
        sessionName,
        brewDate: brewDate ? new Date(brewDate) : new Date(),
        batchNumber,
        method,
        batchSize,
        batchSizeUnit,
        notes,
      });

      const savedSession = await session.save();
      res.status(201).json(savedSession);
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e: any) => e.message);
        return res.status(400).json({ error: 'Validation failed', details: messages });
      }
      res.status(500).json({ error: 'Failed to create brew session' });
    }
  }
);

// List brew sessions
brewSessionRouter.get(
  '/',
  auth,
  validate([
    query('status')
      .optional()
      .isIn(['planned', 'in_progress', 'fermenting', 'conditioning', 'bottled', 'consumed'])
      .withMessage('Status must be a valid status'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ]),
  async (req: Request, res: Response) => {
    try {
      const { status, page = '1', limit = '20' } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const filter: any = { userId: req.user!._id };
      if (status) filter.status = status;

      const [sessions, total] = await Promise.all([
        BrewSession.find(filter)
          .sort({ brewDate: -1 })
          .skip(skip)
          .limit(limitNum)
          .populate('recipeId', 'recipeName style'),
        BrewSession.countDocuments(filter),
      ]);

      res.json({
        sessions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch brew sessions' });
    }
  }
);

// Get brew session by ID (with events)
brewSessionRouter.get(
  '/:id',
  auth,
  validate([param('id').isMongoId().withMessage('Invalid session ID')]),
  async (req: Request, res: Response) => {
    try {
      const session = await BrewSession.findOne({
        _id: req.params.id,
        userId: req.user!._id,
      }).populate('recipeId', 'recipeName style method batchSize boilTimeMinutes');

      if (!session) {
        return res.status(404).json({ error: 'Brew session not found' });
      }

      const events = await SessionEvent.find({ sessionId: session._id }).sort({
        timestamp: 1,
      });

      res.json({ session, events });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch brew session' });
    }
  }
);

// Update brew session
brewSessionRouter.put(
  '/:id',
  auth,
  validate(updateBrewSessionValidation),
  async (req: Request, res: Response) => {
    try {
      const session = await BrewSession.findOneAndUpdate(
        { _id: req.params.id, userId: req.user!._id },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!session) {
        return res.status(404).json({ error: 'Brew session not found' });
      }

      res.json(session);
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e: any) => e.message);
        return res.status(400).json({ error: 'Validation failed', details: messages });
      }
      res.status(500).json({ error: 'Failed to update brew session' });
    }
  }
);

// Delete brew session
brewSessionRouter.delete(
  '/:id',
  auth,
  validate([param('id').isMongoId().withMessage('Invalid session ID')]),
  async (req: Request, res: Response) => {
    try {
      const session = await BrewSession.findOneAndDelete({
        _id: req.params.id,
        userId: req.user!._id,
      });

      if (!session) {
        return res.status(404).json({ error: 'Brew session not found' });
      }

      // Also delete associated events
      await SessionEvent.deleteMany({ sessionId: session._id });

      res.json({ message: 'Brew session deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete brew session' });
    }
  }
);

// Log event to brew session
brewSessionRouter.post(
  '/:id/events',
  auth,
  validate(createEventValidation),
  async (req: Request, res: Response) => {
    try {
      const session = await BrewSession.findOne({
        _id: req.params.id,
        userId: req.user!._id,
      });

      if (!session) {
        return res.status(404).json({ error: 'Brew session not found' });
      }

      const event = new SessionEvent({
        sessionId: session._id,
        eventType: req.body.eventType,
        timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
        temperature: req.body.temperature,
        gravityReading: req.body.gravityReading,
        notes: req.body.notes,
        durationMinutes: req.body.durationMinutes,
        hopName: req.body.hopName,
        hopWeight: req.body.hopWeight,
        hopWeightUnit: req.body.hopWeightUnit,
        hopAlphaAcid: req.body.hopAlphaAcid,
        hopBoilMinutes: req.body.hopBoilMinutes,
        mashStepName: req.body.mashStepName,
        targetTemp: req.body.targetTemp,
        actualTemp: req.body.actualTemp,
      });

      const savedEvent = await event.save();
      res.status(201).json(savedEvent);
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e: any) => e.message);
        return res.status(400).json({ error: 'Validation failed', details: messages });
      }
      res.status(500).json({ error: 'Failed to log event' });
    }
  }
);

// List events for brew session
brewSessionRouter.get(
  '/:id/events',
  auth,
  validate([param('id').isMongoId().withMessage('Invalid session ID')]),
  async (req: Request, res: Response) => {
    try {
      const session = await BrewSession.findOne({
        _id: req.params.id,
        userId: req.user!._id,
      });

      if (!session) {
        return res.status(404).json({ error: 'Brew session not found' });
      }

      const events = await SessionEvent.find({ sessionId: session._id }).sort({
        timestamp: 1,
      });

      res.json(events);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  }
);
