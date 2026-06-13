/** Error thrown by the API client for any non-2xx response. */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Thin `fetch` wrapper used by all service functions. Sends/receives JSON,
 * includes cookies, and throws `ApiError` on any non-2xx response.
 */
export async function apiClient<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message =
      (payload && typeof payload === 'object' && 'error' in payload && payload.error) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(String(message), res.status);
  }

  return payload as T;
}
