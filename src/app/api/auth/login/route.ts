import { type NextRequest } from 'next/server';

import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { signToken, verifyPassword } from '@/lib/auth';
import { jsonError, jsonOk, withErrorHandling } from '@/lib/api-helpers';
import { isNonEmptyString } from '@/lib/validation';
import { AUTH_COOKIE, AUTH_COOKIE_MAX_AGE } from '@/lib/constants';

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const body = await req.json().catch(() => null);

    if (!body) {
      return jsonError('Invalid request body', 400);
    }

    const { email, password } = body as { email?: unknown; password?: unknown };

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return jsonError('Email and password are required', 400);
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return jsonError('User not found', 404);
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return jsonError('Invalid credentials', 401);
    }

    const token = signToken({ userId: user._id.toString(), email: user.email });

    const response = jsonOk({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });

    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: AUTH_COOKIE_MAX_AGE,
    });

    return response;
  });
}
