import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { recipeRouter } from '../src/routes/recipes';
import { authRouter } from '../src/routes/auth';
import { errorHandler } from '../src/middleware/errorHandler';
import User from '../src/models/User';
import Recipe from '../src/models/Recipe';
import RecipeIngredient from '../src/models/RecipeIngredient';

let mongoServer: MongoMemoryServer;
let app: express.Application;
let token: string;
let userId: string;
let otherUserId: string;
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
  await User.deleteMany({});
  await Recipe.deleteMany({});
  await RecipeIngredient.deleteMany({});

  app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use('/api/recipes', recipeRouter);
  app.use(errorHandler);

  const userRes = await request(app)
    .post('/api/auth/register')
    .send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User',
    });
  token = userRes.body.token;
  userId = userRes.body.user.id;

  const otherUserRes = await request(app)
    .post('/api/auth/register')
    .send({
      username: 'otheruser',
      email: 'other@example.com',
      password: 'password123',
      displayName: 'Other User',
    });
  otherToken = otherUserRes.body.token;
  otherUserId = otherUserRes.body.user.id;
});

const validRecipe = {
  recipeName: 'Test IPA',
  style: 'American IPA',
  styleCode: '21A',
  method: 'all_grain',
  batchSize: 19,
  batchSizeUnit: 'L',
  boilTimeMinutes: 60,
  efficiency: 75,
  isPublic: false,
  notes: 'A great test recipe',
};

const createRecipe = async (recipeData = validRecipe, authToken = token) => {
  return request(app)
    .post('/api/recipes')
    .set('Authorization', `Bearer ${authToken}`)
    .send(recipeData);
};

describe('Recipe CRUD Endpoints', () => {
  describe('POST /api/recipes', () => {
    it('should create a new recipe', async () => {
      const res = await createRecipe();

      expect(res.status).toBe(201);
      expect(res.body.recipe).toBeDefined();
      expect(res.body.recipe.recipeName).toBe(validRecipe.recipeName);
      expect(res.body.recipe.style).toBe(validRecipe.style);
      expect(res.body.recipe.method).toBe(validRecipe.method);
      expect(res.body.recipe.userId.toString()).toBe(userId);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/recipes')
        .send(validRecipe);

      expect(res.status).toBe(401);
    });

    it('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('should reject invalid method', async () => {
      const res = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validRecipe, method: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/recipes', () => {
    beforeEach(async () => {
      await createRecipe({ ...validRecipe, recipeName: 'Recipe 1' });
      await createRecipe({ ...validRecipe, recipeName: 'Recipe 2' });
      await createRecipe({ ...validRecipe, recipeName: 'Recipe 3' });
    });

    it('should return user recipes with pagination', async () => {
      const res = await request(app)
        .get('/api/recipes')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(3);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(3);
      expect(res.body.pagination.page).toBe(1);
    });

    it('should support pagination params', async () => {
      const res = await request(app)
        .get('/api/recipes?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(2);
      expect(res.body.pagination.total).toBe(3);
      expect(res.body.pagination.pages).toBe(2);
    });

    it('should support sort param', async () => {
      const res = await request(app)
        .get('/api/recipes?sort=-createdAt')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(3);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .get('/api/recipes');

      expect(res.status).toBe(401);
    });

    it('should not return other users private recipes', async () => {
      const res = await request(app)
        .get('/api/recipes')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(0);
    });
  });

  describe('GET /api/recipes/:id', () => {
    let recipeId: string;

    beforeEach(async () => {
      const res = await createRecipe();
      recipeId = res.body.recipe._id;
    });

    it('should return recipe by id for owner', async () => {
      const res = await request(app)
        .get(`/api/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipe._id).toBe(recipeId);
      expect(res.body.recipe.recipeName).toBe(validRecipe.recipeName);
    });

    it('should return public recipe for non-owner', async () => {
      await Recipe.findByIdAndUpdate(recipeId, { isPublic: true });

      const res = await request(app)
        .get(`/api/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.recipe._id).toBe(recipeId);
    });

    it('should reject non-owner accessing private recipe', async () => {
      const res = await request(app)
        .get(`/api/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(404);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .get(`/api/recipes/${recipeId}`);

      expect(res.status).toBe(401);
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
    let recipeId: string;

    beforeEach(async () => {
      const res = await createRecipe();
      recipeId = res.body.recipe._id;
    });

    it('should update recipe by owner', async () => {
      const res = await request(app)
        .put(`/api/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ recipeName: 'Updated IPA' });

      expect(res.status).toBe(200);
      expect(res.body.recipe.recipeName).toBe('Updated IPA');
    });

    it('should reject non-owner update', async () => {
      const res = await request(app)
        .put(`/api/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ recipeName: 'Hacked IPA' });

      expect(res.status).toBe(404);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .put(`/api/recipes/${recipeId}`)
        .send({ recipeName: 'Updated IPA' });

      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent recipe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/recipes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ recipeName: 'Updated IPA' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/recipes/:id', () => {
    let recipeId: string;

    beforeEach(async () => {
      const res = await createRecipe();
      recipeId = res.body.recipe._id;
    });

    it('should soft delete recipe by owner', async () => {
      const res = await request(app)
        .delete(`/api/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);

      const recipe = await Recipe.findById(recipeId);
      expect(recipe?.isArchived).toBe(true);
    });

    it('should reject non-owner delete', async () => {
      const res = await request(app)
        .delete(`/api/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(404);

      const recipe = await Recipe.findById(recipeId);
      expect(recipe?.isArchived).toBe(false);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .delete(`/api/recipes/${recipeId}`);

      expect(res.status).toBe(401);
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
