import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { SECRET_KEY } from '../../configs/env.config';
import { createCustomError } from './customError';

// Generate a JWT token with the given payload.
export function generateToken(
  payload: object,
  expiresIn: StringValue = '1h'
): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// Verify a JWT token and return the decoded payload.
// Throws a custom error if the token is invalid or expired.
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    throw createCustomError(400, 'Invalid or expired token');
  }
}

// Hash a password using bcrypt.
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare a plain password with a hashed password.
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
