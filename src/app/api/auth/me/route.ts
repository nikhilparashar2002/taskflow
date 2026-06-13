import { type NextRequest } from 'next/server';

import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { jsonError, jsonOk, withErrorHandling } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const auth = getUserFromRequest(req);
    if (!auth) {
      return jsonError('Unauthorized', 401);
    }

    await connectDB();

    const user = await User.findById(auth.userId).select('-password');
    if (!user) {
      return jsonError('User not found', 404);
    }

    return jsonOk({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  });
}
