import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';
import User, { IUserDocument } from '../src/models/User';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoURI = mongoServer.getUri();
  await mongoose.connect(mongoURI);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('User Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'password123',
        displayName: 'Test User',
        brewLevel: 'beginner',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser).toBeDefined();
      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.displayName).toBe(userData.displayName);
      expect(savedUser.brewLevel).toBe(userData.brewLevel);
    });

    it('should require username', async () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: 'password123',
        displayName: 'Test User',
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow('Username is required');
    });

    it('should require email', async () => {
      const userData = {
        username: 'testuser',
        passwordHash: 'password123',
        displayName: 'Test User',
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow('Email is required');
    });

    it('should require displayName', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'password123',
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow('Display name is required');
    });

    it('should require passwordHash', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow('Password is required');
    });

    it('should enforce unique username', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'password123',
        displayName: 'Test User',
      };

      await new User(userData).save();

      const duplicateUser = new User({
        ...userData,
        email: 'different@example.com',
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'password123',
        displayName: 'Test User',
      };

      await new User(userData).save();

      const duplicateUser = new User({
        ...userData,
        username: 'differentuser',
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should enforce email format validation', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        passwordHash: 'password123',
        displayName: 'Test User',
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow('Please provide a valid email address');
    });

    it('should enforce username length minimum', async () => {
      const userData = {
        username: 'ab',
        email: 'test@example.com',
        passwordHash: 'password123',
        displayName: 'Test User',
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow('Username must be at least 3 characters');
    });

    it('should enforce username length maximum', async () => {
      const userData = {
        username: 'a'.repeat(31),
        email: 'test@example.com',
        passwordHash: 'password123',
        displayName: 'Test User',
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow('Username must be at most 30 characters');
    });

    it('should enforce displayName length maximum', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'password123',
        displayName: 'a'.repeat(51),
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow('Display name must be at most 50 characters');
    });

    it('should default brewLevel to beginner', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'password123',
        displayName: 'Test User',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.brewLevel).toBe('beginner');
    });

    it('should accept valid brewLevel values', async () => {
      const brewLevels = ['beginner', 'intermediate', 'advanced', 'professional'];

      for (const level of brewLevels) {
        const userData = {
          username: `user_${level}`,
          email: `${level}@example.com`,
          passwordHash: 'password123',
          displayName: `User ${level}`,
          brewLevel: level,
        };

        const user = new User(userData);
        const savedUser = await user.save();

        expect(savedUser.brewLevel).toBe(level);
      }
    });

    it('should reject invalid brewLevel', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'password123',
        displayName: 'Test User',
        brewLevel: 'expert',
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should trim username', async () => {
      const userData = {
        username: '  testuser  ',
        email: 'test@example.com',
        passwordHash: 'password123',
        displayName: 'Test User',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.username).toBe('testuser');
    });

    it('should lowercase email', async () => {
      const userData = {
        username: 'testuser',
        email: 'TEST@EXAMPLE.COM',
        passwordHash: 'password123',
        displayName: 'Test User',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.email).toBe('test@example.com');
    });

    it('should set createdAt and updatedAt timestamps', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'password123',
        displayName: 'Test User',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'mypassword123',
        displayName: 'Test User',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.passwordHash).not.toBe(userData.passwordHash);
      expect(savedUser.passwordHash).toMatch(/^\$2[ab]\$\d{2}\$/);
    });

    it('should use at least 12 salt rounds', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'mypassword123',
        displayName: 'Test User',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      const parts = savedUser.passwordHash.split('$');
      const rounds = parseInt(parts[2], 10);
      expect(rounds).toBeGreaterThanOrEqual(12);
    });

    it('should not rehash password if not modified', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'mypassword123',
        displayName: 'Test User',
      };

      const user = new User(userData);
      const savedUser = await user.save();
      const originalHash = savedUser.passwordHash;

      savedUser.displayName = 'Updated Name';
      await savedUser.save();

      const reloadedUser = await User.findById(savedUser._id);
      expect(reloadedUser?.passwordHash).toBe(originalHash);
    });

    it('should rehash password when modified', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'mypassword123',
        displayName: 'Test User',
      };

      const user = new User(userData);
      const savedUser = await user.save();
      const originalHash = savedUser.passwordHash;

      savedUser.passwordHash = 'newpassword456';
      await savedUser.save();

      expect(savedUser.passwordHash).not.toBe(originalHash);
      expect(savedUser.passwordHash).toMatch(/^\$2[ab]\$\d{2}\$/);
    });
  });

  describe('Password Verification', () => {
    it('should return true for correct password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'mypassword123',
        displayName: 'Test User',
      };

      const user = new User(userData);
      await user.save();

      const isMatch = await user.comparePassword('mypassword123');
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'mypassword123',
        displayName: 'Test User',
      };

      const user = new User(userData);
      await user.save();

      const isMatch = await user.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });

    it('should handle empty password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'mypassword123',
        displayName: 'Test User',
      };

      const user = new User(userData);
      await user.save();

      const isMatch = await user.comparePassword('');
      expect(isMatch).toBe(false);
    });
  });
});
