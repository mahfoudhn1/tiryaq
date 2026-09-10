'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDueFlashcards, submitFlashcardRating } from '@/services/studyService';
import { Flashcard, FlashcardDifficulty } from '@/types/medical';
import FlashcardViewer from './FlashcardViewer';

export default function FlashcardContainer() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSessions, setCompletedSessions] = useState<{ id: string; rating: FlashcardDifficulty }[]>([]);

  useEffect(() => {
    async function loadCards() {
      try {
        const dueCards = await getDueFlashcards();
        setCards(dueCards);
      } catch (error) {
        console.error('Failed to load due flashcards:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCards();
  }, []);

  const handleRate = async (rating: FlashcardDifficulty) => {
    if (cards.length === 0 || currentIndex >= cards.length || isSubmitting) return;
    
    const currentCard = cards[currentIndex];
    setIsSubmitting(true);
    
    try {
      await submitFlashcardRating(currentCard.id, rating);
      setCompletedSessions((prev) => [...prev, { id: currentCard.id, rating }]);
      
      // Move to next card
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to submit card rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = async () => {
    setLoading(true);
    setCurrentIndex(0);
    setCompletedSessions([]);
    try {
      const dueCards = await getDueFlashcards();
      setCards(dueCards);
    } catch (error) {
      console.error('Failed to reload due flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-8 animate-pulse">
        {/* Helper bar skeleton */}
        <div className="h-14 bg-white rounded-xl border border-gray-100"></div>
        {/* Card skeleton */}
        <div className="h-[380px] bg-white rounded-3xl border border-gray-200"></div>
        {/* Buttons skeleton */}
        <div className="h-24 bg-white rounded-2xl border border-gray-200"></div>
      </div>
    );
  }

  // Session completed / No cards due state
  if (cards.length === 0 || currentIndex >= cards.length) {
    const statsAgain = completedSessions.filter(s => s.rating === 'Again').length;
    const statsEasy = completedSessions.filter(s => s.rating === 'Easy').length;
    const statsGood = completedSessions.filter(s => s.rating === 'Good').length;
    const statsHard = completedSessions.filter(s => s.rating === 'Hard').length;

    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-12 text-center shadow-lg">
        <div className="h-16 w-16 bg-[#EAF2FF] text-[#3B82F6] rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
          🎓
        </div>
        
        <h2 className="text-3xl font-black text-[#0B192C]">Clinical Review Complete!</h2>
        <p className="text-[#64748B] text-sm mt-2 max-w-md mx-auto">
          Excellent effort. Your performance ratings have been logged to the spaced repetition algorithm to optimize your future clinical schedules.
        </p>

        {completedSessions.length > 0 && (
          <div className="mt-8 bg-[#F4F7FB] rounded-2xl p-6 border border-gray-200/50 text-left">
            <h3 className="font-bold text-xs text-[#0B192C] uppercase tracking-wider mb-4 text-center">Session Metrics Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-xl border text-center shadow-sm">
                <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Again</span>
                <p className="text-xl font-black text-[#FF5A5F] mt-1">{statsAgain}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border text-center shadow-sm">
                <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Hard</span>
                <p className="text-xl font-black text-amber-500 mt-1">{statsHard}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border text-center shadow-sm">
                <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Good</span>
                <p className="text-xl font-black text-[#3B82F6] mt-1">{statsGood}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border text-center shadow-sm">
                <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Easy</span>
                <p className="text-xl font-black text-emerald-600 mt-1">{statsEasy}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-[#0B192C] hover:bg-[#1E2A38] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors shadow"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={handleRestart}
            className="bg-white border border-gray-300 text-[#334155] hover:bg-gray-50 px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            Review Same Cards Again
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="space-y-6">
      {/* Session Progress Tracker */}
      <div className="flex justify-between items-center bg-white rounded-2xl border border-gray-100 p-4 sm:px-6 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-[#3B82F6]"></span>
          <span className="text-xs font-bold text-[#0B192C]">ACTIVE REVIEW SESSION</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-[#64748B] font-semibold">
            Card <strong className="text-[#0B192C]">{currentIndex + 1}</strong> of <strong className="text-[#0B192C]">{cards.length}</strong>
          </span>
          <div className="w-20 bg-gray-100 h-2 rounded-full">
            <div 
              className="bg-[#3B82F6] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Flashcard Viewer */}
      <FlashcardViewer
        key={currentCard.id}
        card={currentCard}
        onRate={handleRate}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
