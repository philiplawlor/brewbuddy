import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import BrewSession from '../src/models/BrewSession';
import SessionEvent from '../src/models/SessionEvent';
import User from '../src/models/User';
import Recipe from '../src/models/Recipe';

let mongoServer: MongoMemoryServer;
let userId: mongoose.Types.ObjectId;
let recipeId: mongoose.Types.ObjectId;

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

  const recipe = await new Recipe({
    userId,
    recipeName: 'Test IPA',
    method: 'all_grain',
    style: 'American IPA',
  }).save();
  recipeId = recipe._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await BrewSession.deleteMany({});
  await SessionEvent.deleteMany({});
});

describe('BrewSession Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid brew session', async () => {
      const sessionData = {
        userId,
        recipeId,
        sessionName: 'Batch #42',
        brewDate: new Date('2026-06-15'),
        status: 'planned' as const,
      };

      const session = new BrewSession(sessionData);
      const savedSession = await session.save();

      expect(savedSession).toBeDefined();
      expect(savedSession._id).toBeDefined();
      expect(savedSession.sessionName).toBe('Batch #42');
      expect(savedSession.status).toBe('planned');
      expect(savedSession.userId.toString()).toBe(userId.toString());
      expect(savedSession.recipeId.toString()).toBe(recipeId.toString());
    });

    it('should require userId', async () => {
      const sessionData = {
        recipeId,
        brewDate: new Date(),
      };

      const session = new BrewSession(sessionData);
      await expect(session.save()).rejects.toThrow('User ID is required');
    });

    it('should require recipeId', async () => {
      const sessionData = {
        userId,
        brewDate: new Date(),
      };

      const session = new BrewSession(sessionData);
      await expect(session.save()).rejects.toThrow('Recipe ID is required');
    });

    it('should default brewDate when not provided', async () => {
      const before = new Date();
      const sessionData = {
        userId,
        recipeId,
      };

      const session = new BrewSession(sessionData);
      const saved = await session.save();
      const after = new Date();

      expect(saved.brewDate).toBeDefined();
      expect(saved.brewDate.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
      expect(saved.brewDate.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
    });

    it('should default status to planned', async () => {
      const session = new BrewSession({
        userId,
        recipeId,
        brewDate: new Date(),
      });

      const saved = await session.save();
      expect(saved.status).toBe('planned');
    });

    it('should default brewDate to now', async () => {
      const before = new Date();
      const session = new BrewSession({
        userId,
        recipeId,
      });

      const saved = await session.save();
      const after = new Date();

      expect(saved.brewDate.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
      expect(saved.brewDate.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
    });

    it('should reject invalid status', async () => {
      const session = new BrewSession({
        userId,
        recipeId,
        brewDate: new Date(),
        status: 'invalid_status',
      });

      await expect(session.save()).rejects.toThrow();
    });

    it('should accept all valid statuses', async () => {
      const statuses = [
        'planned',
        'in_progress',
        'fermenting',
        'conditioning',
        'bottled',
        'consumed',
      ];

      for (const status of statuses) {
        const session = new BrewSession({
          userId,
          recipeId,
          brewDate: new Date(),
          status,
        });

        const saved = await session.save();
        expect(saved.status).toBe(status);
      }
    });

    it('should reject invalid method', async () => {
      const session = new BrewSession({
        userId,
        recipeId,
        brewDate: new Date(),
        method: 'invalid_method',
      });

      await expect(session.save()).rejects.toThrow();
    });

    it('should accept all valid methods', async () => {
      const methods = ['all_grain', 'partial_mash', 'extract', 'biab'];

      for (const method of methods) {
        const session = new BrewSession({
          userId,
          recipeId,
          brewDate: new Date(),
          method,
        });

        const saved = await session.save();
        expect(saved.method).toBe(method);
      }
    });

    it('should reject negative batchSize', async () => {
      const session = new BrewSession({
        userId,
        recipeId,
        brewDate: new Date(),
        batchSize: -5,
      });

      await expect(session.save()).rejects.toThrow('Batch size cannot be negative');
    });

    it('should reject negative brewDurationMinutes', async () => {
      const session = new BrewSession({
        userId,
        recipeId,
        brewDate: new Date(),
        brewDurationMinutes: -10,
      });

      await expect(session.save()).rejects.toThrow('Brew duration cannot be negative');
    });

    it('should reject humidity outside 0-100', async () => {
      const session = new BrewSession({
        userId,
        recipeId,
        brewDate: new Date(),
        humidity: 150,
      });

      await expect(session.save()).rejects.toThrow();
    });

    it('should reject negative totalCost', async () => {
      const session = new BrewSession({
        userId,
        recipeId,
        brewDate: new Date(),
        totalCost: -100,
      });

      await expect(session.save()).rejects.toThrow('Total cost cannot be negative');
    });
  });

  describe('Indexes', () => {
    it('should have userId index', async () => {
      const indexes = await BrewSession.collection.getIndexes();
      expect(indexes).toHaveProperty('userId_1');
    });

    it('should have recipeId index', async () => {
      const indexes = await BrewSession.collection.getIndexes();
      expect(indexes).toHaveProperty('recipeId_1');
    });

    it('should have status index', async () => {
      const indexes = await BrewSession.collection.getIndexes();
      expect(indexes).toHaveProperty('status_1');
    });

    it('should have brewDate index', async () => {
      const indexes = await BrewSession.collection.getIndexes();
      expect(indexes).toHaveProperty('brewDate_-1');
    });
  });

  describe('Query Performance', () => {
    it('should find sessions by userId', async () => {
      await BrewSession.create([
        { userId, recipeId, brewDate: new Date(), sessionName: 'Session 1' },
        { userId, recipeId, brewDate: new Date(), sessionName: 'Session 2' },
      ]);

      const sessions = await BrewSession.find({ userId });
      expect(sessions).toHaveLength(2);
    });

    it('should find sessions by status', async () => {
      await BrewSession.create([
        { userId, recipeId, brewDate: new Date(), status: 'planned' },
        { userId, recipeId, brewDate: new Date(), status: 'in_progress' },
        { userId, recipeId, brewDate: new Date(), status: 'planned' },
      ]);

      const sessions = await BrewSession.find({ status: 'planned' });
      expect(sessions).toHaveLength(2);
    });

    it('should find sessions sorted by brewDate descending', async () => {
      const date1 = new Date('2026-01-01');
      const date2 = new Date('2026-06-15');

      await BrewSession.create([
        { userId, recipeId, brewDate: date1, sessionName: 'Old' },
        { userId, recipeId, brewDate: date2, sessionName: 'New' },
      ]);

      const sessions = await BrewSession.find({ userId }).sort({ brewDate: -1 });
      expect(sessions[0].sessionName).toBe('New');
      expect(sessions[1].sessionName).toBe('Old');
    });
  });
});

describe('SessionEvent Model', () => {
  let sessionId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const session = await new BrewSession({
      userId,
      recipeId,
      brewDate: new Date(),
      status: 'in_progress',
    }).save();
    sessionId = session._id;
  });

  describe('Schema Validation', () => {
    it('should create a valid session event', async () => {
      const eventData = {
        sessionId,
        eventType: 'mash_in' as const,
        timestamp: new Date(),
        temperature: 152,
        notes: 'Strike water ready',
      };

      const event = new SessionEvent(eventData);
      const savedEvent = await event.save();

      expect(savedEvent).toBeDefined();
      expect(savedEvent._id).toBeDefined();
      expect(savedEvent.eventType).toBe('mash_in');
      expect(savedEvent.temperature).toBe(152);
      expect(savedEvent.notes).toBe('Strike water ready');
    });

    it('should require sessionId', async () => {
      const eventData = {
        eventType: 'mash_in',
        timestamp: new Date(),
      };

      const event = new SessionEvent(eventData);
      await expect(event.save()).rejects.toThrow('Session ID is required');
    });

    it('should require eventType', async () => {
      const eventData = {
        sessionId,
        timestamp: new Date(),
      };

      const event = new SessionEvent(eventData);
      await expect(event.save()).rejects.toThrow('Event type is required');
    });

    it('should default timestamp when not provided', async () => {
      const before = new Date();
      const event = new SessionEvent({
        sessionId,
        eventType: 'mash_in',
      });

      const saved = await event.save();
      const after = new Date();

      expect(saved.timestamp).toBeDefined();
      expect(saved.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
      expect(saved.timestamp.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
    });

    it('should default timestamp to now', async () => {
      const before = new Date();
      const event = new SessionEvent({
        sessionId,
        eventType: 'mash_in',
      });

      const saved = await event.save();
      const after = new Date();

      expect(saved.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
      expect(saved.timestamp.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
    });

    it('should reject invalid eventType', async () => {
      const event = new SessionEvent({
        sessionId,
        eventType: 'invalid_event',
        timestamp: new Date(),
      });

      await expect(event.save()).rejects.toThrow();
    });

    it('should accept all valid event types', async () => {
      const eventTypes = [
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
      ];

      for (const eventType of eventTypes) {
        const event = new SessionEvent({
          sessionId,
          eventType,
          timestamp: new Date(),
        });

        const saved = await event.save();
        expect(saved.eventType).toBe(eventType);
      }
    });

    it('should reject invalid hopWeightUnit', async () => {
      const event = new SessionEvent({
        sessionId,
        eventType: 'hop_addition',
        timestamp: new Date(),
        hopWeightUnit: 'kg',
      });

      await expect(event.save()).rejects.toThrow();
    });

    it('should accept valid hopWeightUnit', async () => {
      const units = ['g', 'oz', 'lb'];

      for (const unit of units) {
        const event = new SessionEvent({
          sessionId,
          eventType: 'hop_addition',
          timestamp: new Date(),
          hopWeightUnit: unit,
        });

        const saved = await event.save();
        expect(saved.hopWeightUnit).toBe(unit);
      }
    });

    it('should reject negative hopWeight', async () => {
      const event = new SessionEvent({
        sessionId,
        eventType: 'hop_addition',
        timestamp: new Date(),
        hopWeight: -5,
      });

      await expect(event.save()).rejects.toThrow('Hop weight cannot be negative');
    });

    it('should reject hopAlphaAcid outside 0-100', async () => {
      const event = new SessionEvent({
        sessionId,
        eventType: 'hop_addition',
        timestamp: new Date(),
        hopAlphaAcid: 150,
      });

      await expect(event.save()).rejects.toThrow();
    });

    it('should reject negative durationMinutes', async () => {
      const event = new SessionEvent({
        sessionId,
        eventType: 'boil_start',
        timestamp: new Date(),
        durationMinutes: -30,
      });

      await expect(event.save()).rejects.toThrow('Duration cannot be negative');
    });
  });

  describe('Indexes', () => {
    it('should have sessionId + timestamp index', async () => {
      const indexes = await SessionEvent.collection.getIndexes();
      expect(indexes).toHaveProperty('sessionId_1_timestamp_1');
    });

    it('should have sessionId + eventType index', async () => {
      const indexes = await SessionEvent.collection.getIndexes();
      expect(indexes).toHaveProperty('sessionId_1_eventType_1');
    });
  });

  describe('Query Performance', () => {
    it('should find events by sessionId sorted by timestamp', async () => {
      const time1 = new Date('2026-06-15T10:00:00Z');
      const time2 = new Date('2026-06-15T10:30:00Z');

      await SessionEvent.create([
        { sessionId, eventType: 'mash_in', timestamp: time1 },
        { sessionId, eventType: 'mash_out', timestamp: time2 },
      ]);

      const events = await SessionEvent.find({ sessionId }).sort({ timestamp: 1 });
      expect(events).toHaveLength(2);
      expect(events[0].eventType).toBe('mash_in');
      expect(events[1].eventType).toBe('mash_out');
    });

    it('should find events by sessionId and eventType', async () => {
      await SessionEvent.create([
        { sessionId, eventType: 'mash_in', timestamp: new Date() },
        { sessionId, eventType: 'hop_addition', timestamp: new Date() },
        { sessionId, eventType: 'hop_addition', timestamp: new Date() },
      ]);

      const hopEvents = await SessionEvent.find({
        sessionId,
        eventType: 'hop_addition',
      });
      expect(hopEvents).toHaveLength(2);
    });
  });
});
