import { apiGet, apiPost } from './client';
import { LiveSession } from '@/types/medical';

export type LiveSessionFilter = 'all' | 'live' | 'upcoming' | 'ended';

export function getLiveSessions(filter: LiveSessionFilter = 'all'): Promise<LiveSession[]> {
  return apiGet<LiveSession[]>('/api/live-sessions/', {
    query: filter === 'all' ? undefined : { filter },
  });
}

export function getLiveSession(id: string): Promise<LiveSession | null> {
  return apiGet<LiveSession>(`/api/live-sessions/${id}/`).catch(() => null);
}

export function registerForLiveSession(
  id: string,
): Promise<{ registered: boolean; alreadyRegistered: boolean; session: LiveSession }> {
  return apiPost<{ registered: boolean; alreadyRegistered: boolean; session: LiveSession }>(
    `/api/live-sessions/${id}/register/`,
  );
}
