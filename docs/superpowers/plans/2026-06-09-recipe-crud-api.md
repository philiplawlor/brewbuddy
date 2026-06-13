# Recipe CRUD API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create CRUD routes for recipes with authentication, pagination, and soft delete.

**Architecture:** Express Router with auth middleware, input validation via express-validator, and MongoDB queries. Tests use supertest with mongodb-memory-server.

**Tech Stack:** Express, TypeScript, Mongoose, express-validator, Jest, supertest, mongodb-memory-server

---

## File Structure

| File | Purpose |
|------|---------|
| `backend/src/routes/recipes.ts` | Recipe CRUD routes |
| `backend/__tests__/recipes-crud.test.ts` | Integration tests |
| `backend/src/index.ts` | Mount recipes router (modify) |

---

## Task 1: Create Recipe Routes with GET /api/recipes

**Files:**
- Create: `backend/src/routes/recipes.ts`
- Modify: `backend/src/index.ts:21` (add route mount)

- [ ] **Step 1: Create the recipes router file with GET /api/recipes endpoint**

```typescript
// backend/src/routes/recipes.ts
import { Router, Request, Response } from 'express';
import { query } from 'express-validator';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import Recipe from '../models/Recipe';

export const recipesRouter = Router();

const listValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

recipesRouter.get(
  '/',
  auth,
  validate(listValidation),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!._id;
      const page = (req.query.page as unknown as number) || 1;
      const limit = (req.query.limit as unknown as number) || 20;
      const skip = (page - 1) * limit;

      const [recipes, total] = await Promise.all([
        Recipe.find({ userId, isArchived: false })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Recipe.countDocuments({ userId, isArchived: false }),
      ]);

      res.status(200).json({
        recipes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      throw error;
    }
  }
);
```

- [ ] **Step 2: Mount recipes router in index.ts**

```typescript
// Add import at top of backend/src/index.ts
import { recipesRouter } from './routes/recipes';

// Add route mount after line 21 (after authRouter)
app.use('/api/recipes', recipesRouter);
```

- [ ] **Step 3: Run existing tests to verify no regressions**

Run: `npm test`
Expected: All existing tests pass

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/recipes.ts backend/src/index.ts
git commit -m "feat(recipes): add GET /api/recipes endpoint with pagination"
```

---

## Task 2: Add POST /api/recipes Endpoint

**Files:**
- Modify: `backend/src/routes/recipes.ts`

- [ ] **Step 1: Add POST /api/recipes endpoint with validation**

```typescript
// Add to backend/src/routes/recipes.ts after GET endpoint
import { body } from 'express-validator';

const createValidation = [
  body('recipeName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Recipe name must be between 1 and 100 characters'),
  body('method')
    .isIn(['all_grain', 'partial_mash', 'extract', 'biab'])
    .withMessage('Method must be all_grain, partial_mash, extract, or biab'),
  body('style').optional().trim().isLength({ max: 100 }),
  body('styleCode').optional().trim().isLength({ max: 10 }),
  body('batchSize').optional().isFloat({ min: 0 }),
  body('batchSizeUnit').optional().isIn(['L', 'gal', 'bbl']),
  body('boilTimeMinutes').optional().isInt({ min: 0 }),
  body('efficiency').optional().isFloat({ min: 0, max: 100 }),
];

recipesRouter.post(
  '/',
  auth,
  validate(createValidation),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!._id;
      const {
        recipeName,
        method,
        style,
        styleCode,
        batchSize,
        batchSizeUnit,
        boilTimeMinutes,
        efficiency,
        notes,
        tasteNotes,
        mashProfile,
        fermentationProfile,
      } = req.body;

      const recipe = new Recipe({
        userId,
        recipeName,
        method,
        style,
        styleCode,
        batchSize,
        batchSizeUnit,
        boilTimeMinutes,
        efficiency,
        notes,
        tasteNotes,
        mashProfile,
        fermentationProfile,
      });

      const savedRecipe = await recipe.save();

      res.status(201).json({ recipe: savedRecipe });
    } catch (error) {
      throw error;
    }
  }
);
```

- [ ] **Step 2: Run tests to verify**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add backend/src/routes/recipes.ts
git commit -m "feat(recipes): add POST /api/recipes endpoint"
```

---

## Task 3: Add GET /api/recipes/:id Endpoint

**Files:**
- Modify: `backend/src/routes/recipes.ts`

- [ ] **Step 1: Add GET /api/recipes/:id endpoint**

```typescript
// Add to backend/src/routes/recipes.ts after POST endpoint
import { param } from 'express-validator';

const getByIdValidation = [
  param('id').isMongoId().withMessage('Invalid recipe ID'),
];

recipesRouter.get(
  '/:id',
  auth,
  validate(getByIdValidation),
  async (req: Request, res: Response) => {
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
  }
);
```

- [ ] **Step 2: Run tests to verify**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add backend/src/routes/recipes.ts
git commit -m "feat(recipes): add GET /api/recipes/:id endpoint"
```

---

## Task 4: Add PUT /api/recipes/:id Endpoint

**Files:**
- Modify: `backend/src/routes/recipes.ts`

- [ ] **Step 1: Add PUT /api/recipes/:id endpoint**

```typescript
// Add to backend/src/routes/recipes.ts after GET /:id endpoint
const updateValidation = [
  param('id').isMongoId().withMessage('Invalid recipe ID'),
  body('recipeName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Recipe name must be between 1 and 100 characters'),
  body('method')
    .optional()
    .isIn(['all_grain', 'partial_mash', 'extract', 'biab'])
    .withMessage('Method must be all_grain, partial_mash, extract, or biab'),
  body('style').optional().trim().isLength({ max: 100 }),
  body('styleCode').optional().trim().isLength({ max: 10 }),
  body('batchSize').optional().isFloat({ min: 0 }),
  body('batchSizeUnit').optional().isIn(['L', 'gal', 'bbl']),
  body('boilTimeMinutes').optional().isInt({ min: 0 }),
  body('efficiency').optional().isFloat({ min: 0, max: 100 }),
];

recipesRouter.put(
  '/:id',
  auth,
  validate(updateValidation),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!._id;

      const recipe = await Recipe.findById(id);

      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      if (recipe.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const allowedUpdates = [
        'recipeName',
        'method',
        'style',
        'styleCode',
        'batchSize',
        'batchSizeUnit',
        'boilTimeMinutes',
        'efficiency',
        'notes',
        'tasteNotes',
        'tasteRating',
        'isPublic',
        'isTemplate',
        'mashProfile',
        'fermentationProfile',
      ];

      for (const field of allowedUpdates) {
        if (req.body[field] !== undefined) {
          (recipe as any)[field] = req.body[field];
        }
      }

      recipe.version = recipe.version + 1;

      const updatedRecipe = await recipe.save();

      res.status(200).json({ recipe: updatedRecipe });
    } catch (error) {
      throw error;
    }
  }
);
```

- [ ] **Step 2: Run tests to verify**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add backend/src/routes/recipes.ts
git commit -m "feat(recipes): add PUT /api/recipes/:id endpoint"
```

---

## Task 5: Add DELETE /api/recipes/:id Endpoint

**Files:**
- Modify: `backend/src/routes/recipes.ts`

- [ ] **Step 1: Add DELETE /api/recipes/:id endpoint with soft delete**

```typescript
// Add to backend/src/routes/recipes.ts after PUT endpoint
const deleteValidation = [
  param('id').isMongoId().withMessage('Invalid recipe ID'),
];

recipesRouter.delete(
  '/:id',
  auth,
  validate(deleteValidation),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!._id;

      const recipe = await Recipe.findById(id);

      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      if (recipe.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      recipe.isArchived = true;
      await recipe.save();

      res.status(200).json({ message: 'Recipe deleted' });
    } catch (error) {
      throw error;
    }
  }
);
```

- [ ] **Step 2: Run tests to verify**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add backend/src/routes/recipes.ts
git commit -m "feat(recipes): add DELETE /api/recipes/:id soft delete endpoint"
```

---

## Task 6: Write Integration Tests

**Files:**
- Create: `backend/__tests__/recipes-crud.test.ts`

- [ ] **Step 1: Create test file with setup and GET /api/recipes tests**

```typescript
// backend/__tests__/recipes-crud.test.ts
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import { recipesRouter } from '../src/routes/recipes';
import { errorHandler } from '../src/middleware/errorHandler';
import Recipe from '../src/models/Recipe';
import User from '../src/models/User';

let mongoServer: MongoMemoryServer;
let app: express.Application;
let userId: mongoose.Types.ObjectId;
let token: string;
let otherUserId: mongoose.Types.ObjectId;
let otherToken: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoURI = mongoServer.getUri();
  await mongoose.connect(mongoURI);

  process.env.JWT_SECRET = 'test-secret';
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Recipe.deleteMany({});
  await User.deleteMany({});

  const user = await new User({
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'password123',
    displayName: 'Test User',
  }).save();
  userId = user._id;
  token = jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });

  const otherUser = await new User({
    username: 'otheruser',
    email: 'other@example.com',
    passwordHash: 'password123',
    displayName: 'Other User',
  }).save();
  otherUserId = otherUser._id;
  otherToken = jwt.sign({ userId: otherUserId.toString() }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });

  app = express();
  app.use(express.json());
  app.use('/api/recipes', recipesRouter);
  app.use(errorHandler);
});

describe('Recipe CRUD Endpoints', () => {
  const validRecipe = {
    recipeName: 'My IPA',
    method: 'all_grain',
    style: 'American IPA',
    styleCode: '21A',
    batchSize: 20,
    batchSizeUnit: 'L',
    boilTimeMinutes: 60,
    efficiency: 75,
  };

  describe('GET /api/recipes', () => {
    it('should return empty array when no recipes', async () => {
      const res = await request(app)
        .get('/api/recipes')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });

    it('should return user recipes with pagination', async () => {
      await Recipe.create([
        { userId, recipeName: 'Recipe 1', method: 'all_grain' },
        { userId, recipeName: 'Recipe 2', method: 'extract' },
        { userId, recipeName: 'Recipe 3', method: 'biab' },
      ]);

      const res = await request(app)
        .get('/api/recipes')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(3);
      expect(res.body.pagination.total).toBe(3);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(20);
    });

    it('should not return other user recipes', async () => {
      await Recipe.create([
        { userId, recipeName: 'My Recipe', method: 'all_grain' },
        { userId: otherUserId, recipeName: 'Other Recipe', method: 'all_grain' },
      ]);

      const res = await request(app)
        .get('/api/recipes')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(1);
      expect(res.body.recipes[0].recipeName).toBe('My Recipe');
    });

    it('should not return archived recipes', async () => {
      await Recipe.create([
        { userId, recipeName: 'Active', method: 'all_grain' },
        { userId, recipeName: 'Archived', method: 'all_grain', isArchived: true },
      ]);

      const res = await request(app)
        .get('/api/recipes')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(1);
      expect(res.body.recipes[0].recipeName).toBe('Active');
    });

    it('should support pagination', async () => {
      const recipes = Array.from({ length: 25 }, (_, i) => ({
        userId,
        recipeName: `Recipe ${i + 1}`,
        method: 'all_grain' as const,
      }));
      await Recipe.create(recipes);

      const res = await request(app)
        .get('/api/recipes?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(10);
      expect(res.body.pagination.total).toBe(25);
      expect(res.body.pagination.pages).toBe(3);
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/recipes');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/recipes', () => {
    it('should create a new recipe', async () => {
      const res = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send(validRecipe);

      expect(res.status).toBe(201);
      expect(res.body.recipe).toBeDefined();
      expect(res.body.recipe.recipeName).toBe(validRecipe.recipeName);
      expect(res.body.recipe.method).toBe(validRecipe.method);
      expect(res.body.recipe.userId).toBe(userId.toString());
    });

    it('should reject missing recipeName', async () => {
      const res = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send({ method: 'all_grain' });

      expect(res.status).toBe(400);
    });

    it('should reject invalid method', async () => {
      const res = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send({ recipeName: 'Test', method: 'invalid' });

      expect(res.status).toBe(400);
    });

    it('should reject request without token', async () => {
      const res = await request(app)
        .post('/api/recipes')
        .send(validRecipe);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/recipes/:id', () => {
    it('should return recipe by id for owner', async () => {
      const recipe = await new Recipe({
        userId,
        ...validRecipe,
      }).save();

      const res = await request(app)
        .get(`/api/recipes/${recipe._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipe.recipeName).toBe(validRecipe.recipeName);
    });

    it('should return public recipe for non-owner', async () => {
      const recipe = await new Recipe({
        userId,
        ...validRecipe,
        isPublic: true,
      }).save();

      const res = await request(app)
        .get(`/api/recipes/${recipe._id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.recipe.recipeName).toBe(validRecipe.recipeName);
    });

    it('should not return private recipe for non-owner', async () => {
      const recipe = await new Recipe({
        userId,
        ...validRecipe,
        isPublic: false,
      }).save();

      const res = await request(app)
        .get(`/api/recipes/${recipe._id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 for non-existent recipe', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/recipes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/recipes/:id', () => {
    it('should update recipe as owner', async () => {
      const recipe = await new Recipe({
        userId,
        ...validRecipe,
      }).save();

      const res = await request(app)
        .put(`/api/recipes/${recipe._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ recipeName: 'Updated IPA' });

      expect(res.status).toBe(200);
      expect(res.body.recipe.recipeName).toBe('Updated IPA');
      expect(res.body.recipe.version).toBe(2);
    });

    it('should not update recipe as non-owner', async () => {
      const recipe = await new Recipe({
        userId,
        ...validRecipe,
      }).save();

      const res = await request(app)
        .put(`/api/recipes/${recipe._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ recipeName: 'Hacked' });

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent recipe', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/recipes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ recipeName: 'Updated' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/recipes/:id', () => {
    it('should soft delete recipe as owner', async () => {
      const recipe = await new Recipe({
        userId,
        ...validRecipe,
      }).save();

      const res = await request(app)
        .delete(`/api/recipes/${recipe._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      const deletedRecipe = await Recipe.findById(recipe._id);
      expect(deletedRecipe?.isArchived).toBe(true);
    });

    it('should not delete recipe as non-owner', async () => {
      const recipe = await new Recipe({
        userId,
        ...validRecipe,
      }).save();

      const res = await request(app)
        .delete(`/api/recipes/${recipe._id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);

      const stillExists = await Recipe.findById(recipe._id);
      expect(stillExists?.isArchived).toBe(false);
    });

    it('should return 404 for non-existent recipe', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/recipes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
```

- [ ] **Step 2: Run all tests**

Run: `npm test`
Expected: All tests pass including new CRUD tests

- [ ] **Step 3: Commit**

```bash
git add backend/__tests__/recipes-crud.test.ts
git commit -m "test(recipes): add integration tests for CRUD operations"
```

---

## Task 7: Verify and Finalize

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: No lint errors

- [ ] **Step 3: Run TypeScript compiler**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "chore: fix lint and type errors"
```

---

## Self-Review Checklist

- [ ] All CRUD endpoints implemented (GET list, POST, GET by id, PUT, DELETE)
- [ ] Auth middleware applied to all endpoints
- [ ] Pagination works for GET /api/recipes
- [ ] Soft delete implemented (isArchived flag)
- [ ] Owner-only access enforced for PUT and DELETE
- [ ] Public recipes visible to non-owners
- [ ] Input validation on all endpoints
- [ ] Integration tests cover all endpoints
- [ ] No type errors
- [ ] No lint errors
