import { NextResponse } from 'next/server';

/** Standard JSON success response. */
export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/** Standard JSON error response with an `error` field. */
export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Wrap a route handler with a uniform try/catch so unexpected failures return
 * a 500 instead of leaking stack traces.
 */
export async function withErrorHandling(
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    console.error('[api] Unhandled error:', error);
    return jsonError('Internal server error', 500);
  }
}
