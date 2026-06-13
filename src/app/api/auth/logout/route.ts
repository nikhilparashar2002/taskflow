import { jsonOk, withErrorHandling } from '@/lib/api-helpers';
import { AUTH_COOKIE } from '@/lib/constants';

export async function POST() {
  return withErrorHandling(async () => {
    const response = jsonOk({ message: 'Logged out' });

    // Expire the auth cookie immediately.
    response.cookies.set(AUTH_COOKIE, '', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });

    return response;
  });
}
