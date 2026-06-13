import { type NextRequest } from 'next/server';

import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { hashPassword } from '@/lib/auth';
import { jsonError, jsonOk, withErrorHandling } from '@/lib/api-helpers';
import { isNonEmptyString, isValidEmail } from '@/lib/validation';

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const body = await req.json().catch(() => null);

    if (!body) {
      return jsonError('Invalid request body', 400);
    }

    const { name, email, password } = body as {
      name?: unknown;
      email?: unknown;
      password?: unknown;
    };

    if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
      return jsonError('Name, email and password are required', 400);
    }

    if (!isValidEmail(email)) {
      return jsonError('Invalid email address', 400);
    }

    if (password.length < 6) {
      return jsonError('Password must be at least 6 characters', 400);
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return jsonError('Email already in use', 409);
    }

    const hashed = await hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
    });

    return jsonOk(
      {
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      201,
    );
  });
}
