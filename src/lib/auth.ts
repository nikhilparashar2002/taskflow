import { type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { AUTH_COOKIE, BCRYPT_SALT_ROUNDS, JWT_EXPIRES_IN } from '@/lib/constants';
import type { JwtPayload } from '@/types/api';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET environment variable. Add it to .env.local.');
  }
  return secret;
}

/** Hash a plaintext password with bcrypt. */
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/** Compare a plaintext password against a bcrypt hash. */
export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Sign a JWT for the given payload. */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

/** Verify a JWT and return its payload, or null if invalid/expired. */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded === 'string') return null;
    const { userId, email } = decoded as jwt.JwtPayload & Partial<JwtPayload>;
    if (!userId || !email) return null;
    return { userId, email };
  } catch {
    return null;
  }
}

/**
 * Read the auth cookie from an incoming request, verify the JWT, and return
 * the authenticated user's payload. Returns null when no valid token exists.
 * Use this at the top of every protected API route.
 */
export function getUserFromRequest(req: NextRequest): JwtPayload | null {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}
