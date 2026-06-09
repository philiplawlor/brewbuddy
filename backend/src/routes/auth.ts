import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import { generateToken } from '../utils/generateToken';
import User from '../models/User';

export const authRouter = Router();

const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('displayName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be between 1 and 50 characters'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

authRouter.post(
  '/register',
  validate(registerValidation),
  async (req: Request, res: Response) => {
    try {
      const { username, email, password, displayName, brewLevel } = req.body;

      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        const field = existingUser.email === email ? 'Email' : 'Username';
        return res.status(400).json({ message: `${field} already exists` });
      }

      const user = new User({
        username,
        email,
        passwordHash: password,
        displayName,
        brewLevel,
      });

      await user.save();

      const token = generateToken(user._id.toString());

      res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          brewLevel: user.brewLevel,
        },
      });
    } catch (error) {
      throw error;
    }
  }
);

authRouter.post(
  '/login',
  validate(loginValidation),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user._id.toString());

      res.status(200).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          brewLevel: user.brewLevel,
        },
      });
    } catch (error) {
      throw error;
    }
  }
);

authRouter.get('/me', auth, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    res.status(200).json({
      user: {
        id: user!._id,
        username: user!.username,
        email: user!.email,
        displayName: user!.displayName,
        brewLevel: user!.brewLevel,
      },
    });
  } catch (error) {
    throw error;
  }
});
