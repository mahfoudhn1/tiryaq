import {
  CaseProgressSummary,
  ClinicalCase,
  ClinicalCaseListItem,
  DashboardSummary,
  DeckSummary,
  Flashcard,
  FlashcardDifficulty,
  QuizQuestion,
  StudyAnalytics,
} from '@/types/medical';

import { apiGet, apiPost } from '@/lib/api/client';

/**
 * Study domain calls. The function names match the previous mock service so
 * components did not need to change when the API replaced the fixtures.
 */

export function getDashboardSummary(): Promise<DashboardSummary> {
  return apiGet<DashboardSummary>('/api/dashboard/summary/');
}

export function getStudyAnalytics(): Promise<StudyAnalytics> {
  return apiGet<StudyAnalytics>('/api/analytics/');
}

export function getDecks(): Promise<DeckSummary[]> {
  return apiGet<DeckSummary[]>('/api/decks/');
}

export function getDueFlashcards(params: { deckId?: string; subject?: string } = {}): Promise<
  Flashcard[]
> {
  return apiGet<Flashcard[]>('/api/flashcards/', {
    query: { due: 1, deck: params.deckId, subject: params.subject },
  });
}

export function submitFlashcardRating(
  id: string,
  rating: FlashcardDifficulty,
): Promise<Flashcard> {
  return apiPost<Flashcard>(`/api/flashcards/${id}/rate/`, { rating });
}

export function getCases(params: { subject?: string; search?: string } = {}): Promise<
  ClinicalCaseListItem[]
> {
  return apiGet<ClinicalCaseListItem[]>('/api/cases/', { query: params });
}

export function getClinicalCase(id: string): Promise<ClinicalCase> {
  return apiGet<ClinicalCase>(`/api/cases/${id}/`);
}

export function getCaseProgress(id: string): Promise<CaseProgressSummary> {
  return apiGet<CaseProgressSummary>(`/api/cases/${id}/progress/`);
}

export function updateCaseProgress(
  id: string,
  payload: { completedSteps?: number; status?: CaseProgressSummary['status'] },
): Promise<CaseProgressSummary> {
  return apiPost<CaseProgressSummary>(`/api/cases/${id}/progress/`, payload);
}

export function getQuizDeck(params: { subject?: string; limit?: number } = {}): Promise<
  QuizQuestion[]
> {
  return apiGet<QuizQuestion[]>('/api/quiz-questions/', { query: params });
}
