/**
 * Thin fetch wrapper for the Tiryaq Django API.
 *
 * Handles the base URL, bearer tokens (kept in localStorage), one automatic
 * refresh-and-retry on a 401, and consistent error objects.
 */

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '');

const ACCESS_KEY = 'tiryaq.accessToken';
const REFRESH_KEY = 'tiryaq.refreshToken';

/**
 * ngrok's free tunnels answer browser-like requests with an HTML warning page
 * (HTTP 200), which breaks JSON parsing. This header opts out of it and is
 * ignored by every non-ngrok host, so it is safe to always send.
 */
const NGROK_BYPASS: Record<string, string> = { 'ngrok-skip-browser-warning': 'true' };

export interface ApiTokens {
  access: string;
  refresh: string;
}

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Set to false for public endpoints (no Authorization header). */
  auth?: boolean;
}

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

export function getAccessToken(): string | null {
  return hasWindow() ? window.localStorage.getItem(ACCESS_KEY) : null;
}

export function getRefreshToken(): string | null {
  return hasWindow() ? window.localStorage.getItem(REFRESH_KEY) : null;
}

export function setTokens(tokens: Partial<ApiTokens>): void {
  if (!hasWindow()) return;
  if (tokens.access) window.localStorage.setItem(ACCESS_KEY, tokens.access);
  if (tokens.refresh) window.localStorage.setItem(REFRESH_KEY, tokens.refresh);
}

export function clearTokens(): void {
  if (!hasWindow()) return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export function buildQuery(query?: RequestOptions['query']): string {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, String(value));
  });
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(status: number, payload: unknown): string {
  if (typeof payload === 'string' && payload) return payload;
  if (payload && typeof payload === 'object') {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === 'string') return detail;
  }
  if (status === 401) return 'Your session expired. Please sign in again.';
  if (status === 403) return 'You do not have access to this resource.';
  if (status === 404) return 'Not found.';
  return `Request failed with status ${status}.`;
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  refreshInFlight ??= (async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...NGROK_BYPASS },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) {
        clearTokens();
        return null;
      }
      const payload = (await response.json()) as ApiTokens;
      setTokens(payload);
      return payload.access ?? null;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/**
 * Perform an API request. Absolute URLs are passed through untouched, so the
 * helper can also be pointed at a different host when needed.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, auth = true, headers, ...rest } = options;
  const url = path.startsWith('http') ? path : `${API_URL}${path}${buildQuery(query)}`;

  const send = async (token: string | null): Promise<Response> =>
    fetch(url, {
      ...rest,
      headers: {
        Accept: 'application/json',
        ...NGROK_BYPASS,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token && auth ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers as Record<string, string> | undefined),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  let response = await send(auth ? getAccessToken() : null);

  if (response.status === 401 && auth && getRefreshToken()) {
    const fresh = await refreshAccessToken();
    if (fresh) response = await send(fresh);
  }

  const payload = await readBody(response);
  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(response.status, payload), payload);
  }
  return payload as T;
}

export const apiGet = <T>(path: string, options: RequestOptions = {}) =>
  apiFetch<T>(path, { ...options, method: 'GET' });

export const apiPost = <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
  apiFetch<T>(path, { ...options, method: 'POST', body });

export const apiPatch = <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
  apiFetch<T>(path, { ...options, method: 'PATCH', body });

export const apiDelete = <T>(path: string, options: RequestOptions = {}) =>
  apiFetch<T>(path, { ...options, method: 'DELETE' });

export { API_URL };
