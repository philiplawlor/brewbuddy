import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';

const getJWTSecret = (): string => process.env.JWT_SECRET || 'fallback-secret';
const getJWTExpiresIn = (): StringValue =>
  (process.env.JWT_EXPIRES_IN || '7d') as unknown as StringValue;

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, getJWTSecret(), { expiresIn: getJWTExpiresIn() });
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, getJWTSecret()) as { userId: string };
};
