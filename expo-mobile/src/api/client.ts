import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const API_URL =
  (process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000').replace(/\/+$/, '');

const ACCESS_KEY = 'tiryaq.accessToken';
const REFRESH_KEY = 'tiryaq.refreshToken';

/**
 * ngrok's free tunnels answer browser-like requests with an HTML warning page
 * (HTTP 200), which would break JSON parsing. This header opts out of it and is
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

export interface RequestOptions {
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean;
}

/**
 * Only the web build has `localStorage`. React Native also defines a global
 * `window`, so checking for `window` alone is not enough — use the platform.
 */
function isWeb(): boolean {
  return Platform.OS === 'web' && typeof localStorage !== 'undefined';
}

export async function getAccessToken(): Promise<string | null> {
  if (isWeb()) {
    return localStorage.getItem(ACCESS_KEY);
  }
  return AsyncStorage.getItem(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  if (isWeb()) {
    return localStorage.getItem(REFRESH_KEY);
  }
  return AsyncStorage.getItem(REFRESH_KEY);
}

export async function setTokens(tokens: Partial<ApiTokens>): Promise<void> {
  if (tokens.access) {
    if (isWeb()) {
      localStorage.setItem(ACCESS_KEY, tokens.access);
    } else {
      await AsyncStorage.setItem(ACCESS_KEY, tokens.access);
    }
  }
  if (tokens.refresh) {
    if (isWeb()) {
      localStorage.setItem(REFRESH_KEY, tokens.refresh);
    } else {
      await AsyncStorage.setItem(REFRESH_KEY, tokens.refresh);
    }
  }
}

export async function clearTokens(): Promise<void> {
  if (isWeb()) {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } else {
    await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
  }
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
  const refresh = await getRefreshToken();
  if (!refresh) return null;

  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...NGROK_BYPASS },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) {
        await clearTokens();
        return null;
      }
      const payload = (await response.json()) as ApiTokens;
      await setTokens(payload);
      return payload.access ?? null;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

interface FetchConfig extends RequestInit {
  method: string;
}

const REQUEST_TIMEOUT_MS = 15_000;

function fetchWithTimeout(url: string, config: FetchConfig): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  return fetch(url, { ...config, signal: controller.signal }).finally(() => {
    clearTimeout(timeout);
  });
}

async function performFetch(
  url: string,
  config: FetchConfig,
  token: string | null,
  auth: boolean,
): Promise<Response> {
  if (auth && token) {
    config.headers = {
      ...(config.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
    };
  }
  let response = await fetchWithTimeout(url, config);

  if (response.status === 401 && auth && (await getRefreshToken())) {
    const fresh = await refreshAccessToken();
    if (fresh) {
      response = await fetchWithTimeout(url, {
        ...config,
        headers: {
          ...(config.headers as Record<string, string>),
          Authorization: `Bearer ${fresh}`,
        },
      });
    }
  }

  return response;
}

export async function apiFetch<T>(
  path: string,
  body: unknown | undefined,
  method: string,
  options: RequestOptions = {},
): Promise<T> {
  const { headers, query, auth = true } = options;
  const url = path.startsWith('http') ? path : `${API_URL}${path}${buildQuery(query)}`;
  const token = auth ? await getAccessToken() : null;

  const config: FetchConfig = {
    method,
    headers: {
      Accept: 'application/json',
      ...NGROK_BYPASS,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  const response = await performFetch(url, config, token, auth);
  const payload = await readBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(response.status, payload), payload);
  }
  return payload as T;
}

export const apiGet = <T>(path: string, options: RequestOptions = {}) =>
  apiFetch<T>(path, undefined, 'GET', options);

export const apiPost = <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
  apiFetch<T>(path, body, 'POST', options);

export const apiPatch = <T>(path: string, body: unknown, options: RequestOptions = {}) =>
  apiFetch<T>(path, body, 'PATCH', options);

export const apiDelete = <T>(path: string, options: RequestOptions = {}) =>
  apiFetch<T>(path, undefined, 'DELETE', options);
