import { User, UserRole } from '@/types/medical';
import { apiGet, apiPatch, apiPost, clearTokens, setTokens } from './client';

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>('/api/auth/login/', { email, password }, { auth: false });
  await setTokens(response);
  return response;
}

export async function demoLogin(role: UserRole): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>('/api/auth/demo-login/', { role }, { auth: false });
  await setTokens(response);
  return response;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  year?: string;
}): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>('/api/auth/register/', payload, { auth: false });
  await setTokens(response);
  return response;
}

export function fetchMe(): Promise<User> {
  return apiGet<User>('/api/auth/me/');
}

export function updateMe(
  patch: Partial<Pick<User, 'name' | 'email' | 'year' | 'avatarUrl'>>,
): Promise<User> {
  return apiPatch<User>('/api/auth/me/', patch);
}

export async function logout(): Promise<void> {
  const refresh = await import('./client').then((m) => m.getRefreshToken());
  try {
    if (refresh) {
      await apiPost<void>('/api/auth/logout/', { refresh }, { auth: false });
    }
  } finally {
    await clearTokens();
  }
}
