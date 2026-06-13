/** Minimal, dependency-free validators shared across API routes. */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Returns true when the string is a parseable date. */
export function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const time = new Date(value).getTime();
  return !Number.isNaN(time);
}
