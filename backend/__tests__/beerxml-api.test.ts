import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { recipeRouter } from '../src/routes/recipes';
import { authRouter } from '../src/routes/auth';
import { errorHandler } from '../src/middleware/errorHandler';
import User from '../src/models/User';
import Recipe from '../src/models/Recipe';

let mongoServer: MongoMemoryServer;
let app: express.Application;
let token: string;
let userId: string;

const SAMPLE_BEERXML = `<?xml version="1.0" encoding="UTF-8"?>
<RECIPES>
  <RECIPE>
    <NAME>Imported IPA</NAME>
    <TYPE>All Grain</TYPE>
    <STYLE><NAME>American IPA</NAME><CATEGORY_NUMBER>21</CATEGORY_NUMBER></STYLE>
    <BATCH_SIZE>20</BATCH_SIZE>
    <BOIL_TIME>60</BOIL_TIME>
    <EFFICIENCY>75</EFFICIENCY>
    <OG>1.065</OG>
    <FG>1.012</FG>
    <NOTES>Great IPA</NOTES>
    <HOPS>
      <HOP><NAME>Citra</NAME><ALPHA>12</ALPHA><AMOUNT>0.028</AMOUNT><TIME>60</TIME><USE>Boil</USE><FORM>Pellet</FORM></HOP>
    </HOPS>
    <FERMENTABLES>
      <FERMENTABLE><NAME>Pale Malt</NAME><AMOUNT>4.5</AMOUNT><YIELD>80</YIELD><COLOR>2</COLOR><TYPE>Grain</TYPE></FERMENTABLE>
    </FERMENTABLES>
    <YEASTS>
      <YEAST><NAME>US-05</NAME><TYPE>Ale</TYPE><FORM>Dry</FORM><LABORATORY>Fermentis</LABORATORY><PRODUCT_ID>US-05</PRODUCT_ID></YEAST>
    </YEASTS>
  </RECIPE>
</RECIPES>`;

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

  app = express();
  app.use(express.json({ limit: '10mb' }));
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
});

describe('BeerXML Import/Export Endpoints', () => {
  describe('POST /api/recipes/import', () => {
    it('should parse valid BeerXML and return preview', async () => {
      const res = await request(app)
        .post('/api/recipes/import')
        .set('Authorization', `Bearer ${token}`)
        .send({ xml: SAMPLE_BEERXML });

      expect(res.status).toBe(200);
      expect(res.body.recipe).toBeDefined();
      expect(res.body.recipe.recipeName).toBe('Imported IPA');
      expect(res.body.recipe.method).toBe('all_grain');
      expect(res.body.recipe.batchSize).toBe(20);
      expect(res.body.hops).toHaveLength(1);
      expect(res.body.hops[0].name).toBe('Citra');
      expect(res.body.fermentables).toHaveLength(1);
      expect(res.body.yeasts).toHaveLength(1);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/recipes/import')
        .send({ xml: SAMPLE_BEERXML });

      expect(res.status).toBe(401);
    });

    it('should reject empty XML', async () => {
      const res = await request(app)
        .post('/api/recipes/import')
        .set('Authorization', `Bearer ${token}`)
        .send({ xml: '' });

      expect(res.status).toBe(400);
    });

    it('should reject malicious XML (XXE)', async () => {
      const maliciousXml = `<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><RECIPES><RECIPE><NAME>&xxe;</NAME></RECIPE></RECIPES>`;

      const res = await request(app)
        .post('/api/recipes/import')
        .set('Authorization', `Bearer ${token}`)
        .send({ xml: maliciousXml });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('dangerous declarations');
    });

    it('should reject oversized XML', async () => {
      const hugeXml = `<?xml version="1.0"?><RECIPES><RECIPE><NAME>${'x'.repeat(1_048_577)}</NAME></RECIPE></RECIPES>`;

      const res = await request(app)
        .post('/api/recipes/import')
        .set('Authorization', `Bearer ${token}`)
        .send({ xml: hugeXml });

      expect(res.status).toBe(413);
    });

    it('should reject malformed XML', async () => {
      const res = await request(app)
        .post('/api/recipes/import')
        .set('Authorization', `Bearer ${token}`)
        .send({ xml: 'not xml at all' });

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/recipes/import/confirm', () => {
    it('should save a parsed recipe', async () => {
      const res = await request(app)
        .post('/api/recipes/import/confirm')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipe: {
            recipeName: 'Confirmed IPA',
            style: 'American IPA',
            method: 'all_grain',
            batchSize: 20,
            boilTimeMinutes: 60,
            efficiency: 75,
            notes: 'Great IPA',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.recipe).toBeDefined();
      expect(res.body.recipe.recipeName).toBe('Confirmed IPA');
      expect(res.body.recipe.userId.toString()).toBe(userId);

      // Verify it's in the database
      const dbRecipe = await Recipe.findById(res.body.recipe._id);
      expect(dbRecipe).not.toBeNull();
      expect(dbRecipe!.recipeName).toBe('Confirmed IPA');
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/recipes/import/confirm')
        .send({
          recipe: { recipeName: 'Test' },
        });

      expect(res.status).toBe(401);
    });

    it('should reject missing recipe data', async () => {
      const res = await request(app)
        .post('/api/recipes/import/confirm')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('should reject empty recipe name', async () => {
      const res = await request(app)
        .post('/api/recipes/import/confirm')
        .set('Authorization', `Bearer ${token}`)
        .send({ recipe: { recipeName: '' } });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/recipes/:id/export', () => {
    it('should export own recipe as BeerXML', async () => {
      // Create a recipe first
      const createRes = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipeName: 'Export Test Stout',
          style: 'Irish Stout',
          method: 'all_grain',
          batchSize: 20,
          boilTimeMinutes: 60,
          efficiency: 72,
        });

      const recipeId = createRes.body.recipe._id;

      const res = await request(app)
        .get(`/api/recipes/${recipeId}/export`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/xml');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.text).toContain('<NAME>Export Test Stout</NAME>');
      expect(res.text).toContain('<TYPE>All Grain</TYPE>');
      expect(res.text).toContain('<BATCH_SIZE>20</BATCH_SIZE>');
    });

    it('should export public recipe of other user', async () => {
      // Create recipe as another user, make it public
      const otherUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'otheruser',
          email: 'other@example.com',
          password: 'password123',
          displayName: 'Other User',
        });
      const otherToken = otherUserRes.body.token;

      const createRes = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          recipeName: 'Public Export',
          style: 'Pale Ale',
          method: 'extract',
          batchSize: 19,
          isPublic: true,
        });

      const recipeId = createRes.body.recipe._id;

      const res = await request(app)
        .get(`/api/recipes/${recipeId}/export`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.text).toContain('<NAME>Public Export</NAME>');
    });

    it('should reject export of private recipe by non-owner', async () => {
      const otherUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'otheruser2',
          email: 'other2@example.com',
          password: 'password123',
          displayName: 'Other User 2',
        });
      const otherToken = otherUserRes.body.token;

      const createRes = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          recipeName: 'Private Recipe',
          method: 'all_grain',
          isPublic: false,
        });

      const recipeId = createRes.body.recipe._id;

      const res = await request(app)
        .get(`/api/recipes/${recipeId}/export`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 for non-existent recipe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/recipes/${fakeId}/export`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should reject unauthenticated request', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/recipes/${fakeId}/export`);

      expect(res.status).toBe(401);
    });
  });
});
