import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { brewSessionRouter } from '../src/routes/brew-sessions';
import { authRouter } from '../src/routes/auth';
import { errorHandler } from '../src/middleware/errorHandler';
import User from '../src/models/User';
import Recipe from '../src/models/Recipe';
import BrewSession from '../src/models/BrewSession';
import SessionEvent from '../src/models/SessionEvent';

let mongoServer: MongoMemoryServer;
let app: express.Application;
let token: string;
let userId: string;
let recipeId: string;

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
  await BrewSession.deleteMany({});
  await SessionEvent.deleteMany({});

  app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use('/api/brew-sessions', brewSessionRouter);
  app.use(errorHandler);

  // Register user and get token
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

  // Create a recipe to link to brew sessions
  const recipe = await new Recipe({
    userId,
    recipeName: 'Test IPA',
    method: 'all_grain',
    style: 'American IPA',
  }).save();
  recipeId = recipe._id.toString();
});

describe('Brew Sessions CRUD API', () => {
  describe('POST /api/brew-sessions', () => {
    it('should create a brew session', async () => {
      const res = await request(app)
        .post('/api/brew-sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipeId,
          sessionName: 'Batch #1',
          brewDate: '2026-06-15',
          method: 'all_grain',
          batchSize: 20,
          batchSizeUnit: 'L',
        });

      expect(res.status).toBe(201);
      expect(res.body.sessionName).toBe('Batch #1');
      expect(res.body.status).toBe('planned');
      expect(res.body.userId).toBe(userId);
      expect(res.body.recipeId).toBe(recipeId);
    });

    it('should default brewDate to now', async () => {
      const before = new Date();
      const res = await request(app)
        .post('/api/brew-sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ recipeId });

      expect(res.status).toBe(201);
      const brewDate = new Date(res.body.brewDate);
      expect(brewDate.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/brew-sessions')
        .send({ recipeId });

      expect(res.status).toBe(401);
    });

    it('should reject missing recipeId', async () => {
      const res = await request(app)
        .post('/api/brew-sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ sessionName: 'No recipe' });

      expect(res.status).toBe(400);
    });

    it('should reject invalid recipeId', async () => {
      const res = await request(app)
        .post('/api/brew-sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ recipeId: 'invalid-id' });

      expect(res.status).toBe(400);
    });

    it('should reject invalid method', async () => {
      const res = await request(app)
        .post('/api/brew-sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ recipeId, method: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/brew-sessions', () => {
    beforeEach(async () => {
      await BrewSession.create([
        { userId, recipeId, brewDate: new Date('2026-01-01'), sessionName: 'Old', status: 'planned' },
        { userId, recipeId, brewDate: new Date('2026-06-15'), sessionName: 'New', status: 'in_progress' },
        { userId, recipeId, brewDate: new Date('2026-03-01'), sessionName: 'Middle', status: 'planned' },
      ]);
    });

    it('should list all brew sessions for user', async () => {
      const res = await request(app)
        .get('/api/brew-sessions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.sessions).toHaveLength(3);
      expect(res.body.pagination.total).toBe(3);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/brew-sessions?status=in_progress')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.sessions).toHaveLength(1);
      expect(res.body.sessions[0].sessionName).toBe('New');
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/brew-sessions?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.sessions).toHaveLength(2);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.total).toBe(3);
      expect(res.body.pagination.pages).toBe(2);
    });

    it('should sort by brewDate descending', async () => {
      const res = await request(app)
        .get('/api/brew-sessions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.body.sessions[0].sessionName).toBe('New');
      expect(res.body.sessions[2].sessionName).toBe('Old');
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/brew-sessions');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/brew-sessions/:id', () => {
    let sessionId: string;

    beforeEach(async () => {
      const session = await new BrewSession({
        userId,
        recipeId,
        brewDate: new Date(),
        sessionName: 'Test Session',
      }).save();
      sessionId = session._id.toString();

      await SessionEvent.create([
        { sessionId: session._id, eventType: 'mash_in', timestamp: new Date('2026-06-15T10:00:00Z') },
        { sessionId: session._id, eventType: 'mash_out', timestamp: new Date('2026-06-15T11:00:00Z') },
      ]);
    });

    it('should get session with events', async () => {
      const res = await request(app)
        .get(`/api/brew-sessions/${sessionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.session.sessionName).toBe('Test Session');
      expect(res.body.events).toHaveLength(2);
      expect(res.body.events[0].eventType).toBe('mash_in');
      expect(res.body.events[1].eventType).toBe('mash_out');
    });

    it('should return 404 for non-existent session', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/brew-sessions/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should not access other user sessions', async () => {
      // Register another user
      const otherRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'other',
          email: 'other@test.com',
          password: 'password123',
          displayName: 'Other',
        });

      const res = await request(app)
        .get(`/api/brew-sessions/${sessionId}`)
        .set('Authorization', `Bearer ${otherRes.body.token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/brew-sessions/:id', () => {
    let sessionId: string;

    beforeEach(async () => {
      const session = await new BrewSession({
        userId,
        recipeId,
        brewDate: new Date(),
        sessionName: 'Original Name',
        status: 'planned',
      }).save();
      sessionId = session._id.toString();
    });

    it('should update session name', async () => {
      const res = await request(app)
        .put(`/api/brew-sessions/${sessionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ sessionName: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.sessionName).toBe('Updated Name');
    });

    it('should update status', async () => {
      const res = await request(app)
        .put(`/api/brew-sessions/${sessionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'in_progress' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('in_progress');
    });

    it('should update actual readings', async () => {
      const res = await request(app)
        .put(`/api/brew-sessions/${sessionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ actualOg: 1.065, actualFg: 1.012, actualAbv: 6.9 });

      expect(res.status).toBe(200);
      expect(res.body.actualOg).toBe(1.065);
      expect(res.body.actualFg).toBe(1.012);
      expect(res.body.actualAbv).toBe(6.9);
    });

    it('should reject invalid status', async () => {
      const res = await request(app)
        .put(`/api/brew-sessions/${sessionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'invalid' });

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent session', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/brew-sessions/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ sessionName: 'Updated' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/brew-sessions/:id', () => {
    let sessionId: string;

    beforeEach(async () => {
      const session = await new BrewSession({
        userId,
        recipeId,
        brewDate: new Date(),
        sessionName: 'To Delete',
      }).save();
      sessionId = session._id.toString();

      await SessionEvent.create([
        { sessionId: session._id, eventType: 'mash_in', timestamp: new Date() },
      ]);
    });

    it('should delete session and events', async () => {
      const res = await request(app)
        .delete(`/api/brew-sessions/${sessionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Brew session deleted');

      // Verify session is deleted
      const session = await BrewSession.findById(sessionId);
      expect(session).toBeNull();

      // Verify events are deleted
      const events = await SessionEvent.find({ sessionId });
      expect(events).toHaveLength(0);
    });

    it('should return 404 for non-existent session', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/brew-sessions/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/brew-sessions/:id/events', () => {
    let sessionId: string;

    beforeEach(async () => {
      const session = await new BrewSession({
        userId,
        recipeId,
        brewDate: new Date(),
        status: 'in_progress',
      }).save();
      sessionId = session._id.toString();
    });

    it('should log a mash_in event', async () => {
      const res = await request(app)
        .post(`/api/brew-sessions/${sessionId}/events`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          eventType: 'mash_in',
          temperature: 152,
          notes: 'Strike water ready',
        });

      expect(res.status).toBe(201);
      expect(res.body.eventType).toBe('mash_in');
      expect(res.body.temperature).toBe(152);
      expect(res.body.notes).toBe('Strike water ready');
    });

    it('should log a hop_addition event', async () => {
      const res = await request(app)
        .post(`/api/brew-sessions/${sessionId}/events`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          eventType: 'hop_addition',
          hopName: 'Citra',
          hopWeight: 28,
          hopWeightUnit: 'g',
          hopAlphaAcid: 12.5,
          hopBoilMinutes: 60,
        });

      expect(res.status).toBe(201);
      expect(res.body.eventType).toBe('hop_addition');
      expect(res.body.hopName).toBe('Citra');
      expect(res.body.hopWeight).toBe(28);
    });

    it('should reject invalid eventType', async () => {
      const res = await request(app)
        .post(`/api/brew-sessions/${sessionId}/events`)
        .set('Authorization', `Bearer ${token}`)
        .send({ eventType: 'invalid' });

      expect(res.status).toBe(400);
    });

    it('should reject event on non-existent session', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/brew-sessions/${fakeId}/events`)
        .set('Authorization', `Bearer ${token}`)
        .send({ eventType: 'mash_in' });

      expect(res.status).toBe(404);
    });

    it('should reject event on other user session', async () => {
      const otherRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'other',
          email: 'other@test.com',
          password: 'password123',
          displayName: 'Other',
        });

      const res = await request(app)
        .post(`/api/brew-sessions/${sessionId}/events`)
        .set('Authorization', `Bearer ${otherRes.body.token}`)
        .send({ eventType: 'mash_in' });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/brew-sessions/:id/events', () => {
    let sessionId: string;

    beforeEach(async () => {
      const session = await new BrewSession({
        userId,
        recipeId,
        brewDate: new Date(),
        status: 'in_progress',
      }).save();
      sessionId = session._id.toString();

      await SessionEvent.create([
        { sessionId: session._id, eventType: 'mash_in', timestamp: new Date('2026-06-15T10:00:00Z') },
        { sessionId: session._id, eventType: 'hop_addition', timestamp: new Date('2026-06-15T11:00:00Z') },
        { sessionId: session._id, eventType: 'flameout', timestamp: new Date('2026-06-15T12:00:00Z') },
      ]);
    });

    it('should list events sorted by timestamp', async () => {
      const res = await request(app)
        .get(`/api/brew-sessions/${sessionId}/events`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(3);
      expect(res.body[0].eventType).toBe('mash_in');
      expect(res.body[1].eventType).toBe('hop_addition');
      expect(res.body[2].eventType).toBe('flameout');
    });

    it('should return 404 for non-existent session', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/brew-sessions/${fakeId}/events`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
