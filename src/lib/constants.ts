/**
 * Centralized application constants. No hardcoded route strings should live
 * in feature code — import from here instead.
 */

/** Auth cookie name holding the signed JWT. */
export const AUTH_COOKIE = 'token';

/** JWT lifetime. */
export const JWT_EXPIRES_IN = '7d';
/** Cookie max-age in seconds (mirrors JWT_EXPIRES_IN: 7 days). */
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/** bcrypt salt rounds for password hashing. */
export const BCRYPT_SALT_ROUNDS = 10;

/** Backend REST endpoints. */
export const API_ROUTES = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
  },
  tasks: {
    base: '/api/tasks',
    byId: (id: string) => `/api/tasks/${id}`,
  },
} as const;

/** Frontend application routes. */
export const APP_ROUTES = {
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  home: '/',
} as const;

/** TanStack Query cache keys. */
export const QUERY_KEYS = {
  tasks: 'tasks',
} as const;

/** Debounce delay (ms) for the task search input. */
export const SEARCH_DEBOUNCE_MS = 300;
