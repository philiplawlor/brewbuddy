import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { recipeRouter } from '../src/routes/recipes';
import { errorHandler } from '../src/middleware/errorHandler';
import User from '../src/models/User';
import Recipe from '../src/models/Recipe';
import RecipeIngredient from '../src/models/RecipeIngredient';

let mongoServer: MongoMemoryServer;
let app: express.Application;
let token: string;
let userId: string;

const JWT_SECRET = 'test-secret';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoURI = mongoServer.getUri();
  await mongoose.connect(mongoURI);
  process.env.JWT_SECRET = JWT_SECRET;
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
  app.use('/api/recipes', recipeRouter);
  app.use(errorHandler);

  const passwordHash = await bcrypt.hash('password123', 10);
  const [user] = await User.insertMany([{
    username: 'testuser',
    email: 'test@example.com',
    passwordHash,
    displayName: 'Test User',
  }]);
  userId = user._id.toString();
  token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
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

describe('Recipe Search & Pagination', () => {
  beforeEach(async () => {
    await createRecipe({ ...validRecipe, recipeName: 'Summer Wheat Ale', style: 'American Wheat Ale' });
    await createRecipe({ ...validRecipe, recipeName: 'Winter Stout', style: 'Oatmeal Stout' });
    await createRecipe({ ...validRecipe, recipeName: 'Hoppy IPA', style: 'American IPA' });
    await createRecipe({ ...validRecipe, recipeName: 'Summer Blonde', style: 'Blonde Ale' });
    await createRecipe({ ...validRecipe, recipeName: 'Hop Bomb DIPA', style: 'Imperial IPA' });
  });

  describe('Search by name', () => {
    it('should filter recipes by partial name match', async () => {
      const res = await request(app)
        .get('/api/recipes?search=Summer')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
      const names = res.body.recipes.map((r: any) => r.recipeName);
      expect(names).toContain('Summer Wheat Ale');
      expect(names).toContain('Summer Blonde');
    });

    it('should be case-insensitive', async () => {
      const res = await request(app)
        .get('/api/recipes?search=hoppy')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(1);
      expect(res.body.recipes[0].recipeName).toBe('Hoppy IPA');
    });

    it('should return empty for no matches', async () => {
      const res = await request(app)
        .get('/api/recipes?search=nonexistent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(0);
      expect(res.body.pagination.total).toBe(0);
    });

    it('should combine with pagination', async () => {
      const res = await request(app)
        .get('/api/recipes?search=Summer&page=1&limit=1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(1);
      expect(res.body.pagination.total).toBe(2);
      expect(res.body.pagination.pages).toBe(2);
    });
  });

  describe('Filter by style', () => {
    it('should filter recipes by exact style', async () => {
      const res = await request(app)
        .get('/api/recipes?style=American IPA')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(1);
      expect(res.body.recipes[0].recipeName).toBe('Hoppy IPA');
    });

    it('should return empty for non-matching style', async () => {
      const res = await request(app)
        .get('/api/recipes?style=Porter')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(0);
    });

    it('should combine style with search', async () => {
      const res = await request(app)
        .get('/api/recipes?search=Hop&style=Imperial IPA')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(1);
      expect(res.body.recipes[0].recipeName).toBe('Hop Bomb DIPA');
    });
  });

  describe('Sort options', () => {
    it('should sort by recipeName ascending', async () => {
      const res = await request(app)
        .get('/api/recipes?sort=recipeName&order=asc')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      const names = res.body.recipes.map((r: any) => r.recipeName);
      expect(names).toEqual([...names].sort());
    });

    it('should sort by recipeName descending', async () => {
      const res = await request(app)
        .get('/api/recipes?sort=recipeName&order=desc')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      const names = res.body.recipes.map((r: any) => r.recipeName);
      expect(names).toEqual([...names].sort().reverse());
    });

    it('should default to desc order', async () => {
      const res = await request(app)
        .get('/api/recipes?sort=recipeName')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      const names = res.body.recipes.map((r: any) => r.recipeName);
      expect(names).toEqual([...names].sort().reverse());
    });
  });

  describe('Pagination', () => {
    it('should return correct pagination metadata', async () => {
      const res = await request(app)
        .get('/api/recipes?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(2);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.total).toBe(5);
      expect(res.body.pagination.pages).toBe(3);
    });

    it('should return second page', async () => {
      const res = await request(app)
        .get('/api/recipes?page=2&limit=2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(2);
      expect(res.body.pagination.page).toBe(2);
    });

    it('should handle page beyond total', async () => {
      const res = await request(app)
        .get('/api/recipes?page=100&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(0);
    });

    it('should clamp limit between 1 and 100', async () => {
      const res = await request(app)
        .get('/api/recipes?limit=200')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(100);
    });

    it('should default to limit 20', async () => {
      const res = await request(app)
        .get('/api/recipes')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(20);
    });
  });

  describe('Combined queries', () => {
    it('should support search + style + sort + pagination', async () => {
      const res = await request(app)
        .get('/api/recipes?search=Hop&sort=recipeName&order=asc&page=1&limit=1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recipes).toHaveLength(1);
      expect(res.body.recipes[0].recipeName).toBe('Hop Bomb DIPA');
      expect(res.body.pagination.total).toBe(2);
      expect(res.body.pagination.pages).toBe(2);
    });
  });
});
