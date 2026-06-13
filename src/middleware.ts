import { NextResponse, type NextRequest } from 'next/server';

import { AUTH_COOKIE } from '@/lib/constants';

/**
 * Lightweight route guard. We only check for the *presence* of the auth cookie
 * here — full JWT signature verification uses the `jsonwebtoken` library, which
 * is not available in the Edge runtime the middleware executes in. Each
 * protected API route independently verifies the token via `getUserFromRequest`,
 * so an invalid token still cannot read or mutate data.
 */
const PROTECTED_PREFIXES = ['/dashboard'];
const AUTH_PAGES = ['/login', '/register'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasToken = Boolean(req.cookies.get(AUTH_COOKIE)?.value);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Unauthenticated user trying to reach a protected page → login.
  if (isProtected && !hasToken) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated user trying to reach an auth page → dashboard.
  if (isAuthPage && hasToken) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
