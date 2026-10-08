import { LiveSession } from '@/types/medical';
import { MOCK_LIVE_SESSIONS } from '@/lib/mock/data';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function getLiveSessions(): Promise<LiveSession[]> {
  await delay();
  return [...MOCK_LIVE_SESSIONS];
}

export async function getLiveSession(id: string): Promise<LiveSession | null> {
  await delay();
  return MOCK_LIVE_SESSIONS.find((s) => s.id === id) ?? null;
}
