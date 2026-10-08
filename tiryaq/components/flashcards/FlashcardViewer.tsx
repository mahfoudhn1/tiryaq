'use client';

import { useCallback, useEffect, useState } from 'react';
import { Flashcard, FlashcardDifficulty } from '@/types/medical';

interface FlashcardViewerProps {
  card: Flashcard;
  onRate: (difficulty: FlashcardDifficulty) => void;
  isSubmitting: boolean;
}

export default function FlashcardViewer({ card, onRate, isSubmitting }: FlashcardViewerProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = useCallback(() => {
    setIsFlipped((flipped) => !flipped);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Avoid firing if user is inside an input (none on this page, but good practice)
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
      return;
    }

    const key = e.key;

    if (key === ' ' || key === 'Spacebar') {
      e.preventDefault();
      handleFlip();
    } else if (isFlipped && !isSubmitting) {
      if (key === '1') {
        onRate('Again');
      } else if (key === '2') {
        onRate('Hard');
      } else if (key === '3') {
        onRate('Good');
      } else if (key === '4') {
        onRate('Easy');
      }
    }
  }, [handleFlip, isFlipped, isSubmitting, onRate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Instructions / Shortcuts Indicator */}
      <div className="flex flex-wrap justify-between items-center text-xs text-[#5B7184] bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-[#0369A1] bg-[#E0F2FE] px-2 py-0.5 rounded border border-[#0369A1]/15">Space</span>
          <span>to flip card</span>
        </div>
        <div className="flex items-center space-x-3 mt-2 sm:mt-0">
          <span className="font-semibold">Shortcuts after flip:</span>
          <span className="flex items-center space-x-1">
            <kbd className="bg-gray-100 border px-1.5 py-0.5 rounded text-gray-600 font-mono text-[10px]">1</kbd>
            <span>Again</span>
          </span>
          <span className="flex items-center space-x-1">
            <kbd className="bg-gray-100 border px-1.5 py-0.5 rounded text-gray-600 font-mono text-[10px]">2</kbd>
            <span>Hard</span>
          </span>
          <span className="flex items-center space-x-1">
            <kbd className="bg-gray-100 border px-1.5 py-0.5 rounded text-gray-600 font-mono text-[10px]">3</kbd>
            <span>Good</span>
          </span>
          <span className="flex items-center space-x-1">
            <kbd className="bg-gray-100 border px-1.5 py-0.5 rounded text-gray-600 font-mono text-[10px]">4</kbd>
            <span>Easy</span>
          </span>
        </div>
      </div>

      {/* 3D Flashcard Container with CSS flip properties */}
      <div 
        className="w-full relative min-h-[380px] cursor-pointer group"
        onClick={handleFlip}
        style={{ perspective: '1000px' }}
      >
        <div 
          className="w-full h-full absolute transition-transform duration-500 rounded-3xl"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '380px'
          }}
        >
          {/* FRONT SIDE (Clinical Vignette) */}
          <div 
            className="absolute inset-0 w-full h-full bg-white rounded-3xl p-8 sm:p-10 border-2 border-gray-200/80 shadow-md flex flex-col justify-between"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0369A1] bg-[#E0F2FE] px-2.5 py-1 rounded-full border border-[#0369A1]/10">
                  CLINICAL VIGNETTE &bull; {card.subject}
                </span>
                <span className="text-xs text-[#5B7184] font-medium">Front of Card</span>
              </div>
              
              <div className="pt-4">
                <p className="text-lg sm:text-xl text-[#0F2A3D] font-semibold leading-relaxed">
                  {card.vignette}
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-center items-center">
              <span className="text-xs font-semibold text-[#5B7184] group-hover:text-[#075985] flex items-center space-x-2 transition-colors">
                <span>🔄 Click Card or Press Spacebar to Reveal Diagnosis</span>
              </span>
            </div>
          </div>

          {/* BACK SIDE (Diagnosis & Rationale) */}
          <div 
            className="absolute inset-0 w-full h-full bg-white rounded-3xl p-8 sm:p-10 border-2 border-[#0369A1]/30 shadow-lg flex flex-col justify-between overflow-y-auto"
            style={{ 
              backfaceVisibility: 'hidden', 
              transform: 'rotateY(180deg)' 
            }}
          >
            <div className="space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-500/10">
                  DIAGNOSIS & RATIONALE
                </span>
                <span className="text-xs text-[#5B7184] font-medium">Back of Card</span>
              </div>

              {/* Core Diagnosis Card */}
              <div className="bg-[#0369A1]/10 border border-[#0369A1]/15 rounded-2xl p-5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#075985] mb-1">Core Clinical Diagnosis</h4>
                <p className="text-xl sm:text-2xl font-black text-[#0F2A3D]">
                  {card.diagnosis}
                </p>
              </div>

              {/* High Yield Explanation */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#5B7184]">High-Yield Rationale</h4>
                <p className="text-sm sm:text-base text-[#5B7184] leading-relaxed font-normal">
                  {card.rationale}
                </p>
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-[#5B7184] font-semibold">
              <span>Card revealed. Grade your recall below.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons (Rating & Transitions) */}
      <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
        {!isFlipped ? (
          <button
            onClick={handleFlip}
            className="w-full bg-[#0369A1] hover:bg-[#075985] text-white py-4 rounded-xl font-bold transition-all shadow-md flex items-center justify-center space-x-2 text-base"
          >
            <span>Reveal Diagnosis</span>
            <kbd className="hidden sm:inline bg-white/20 px-2 py-0.5 rounded text-xs ml-2 font-mono">Space</kbd>
          </button>
        ) : (
          <div className="space-y-5 animate-fadeIn">
            <h4 className="text-center font-bold text-xs text-[#0F2A3D] uppercase tracking-wider">How well did you recall this clinical concept?</h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* AGAIN button */}
              <button
                disabled={isSubmitting}
                onClick={(e) => { e.stopPropagation(); onRate('Again'); }}
                className="bg-white hover:bg-[#DC2626]/5 border border-red-200 hover:border-[#DC2626] rounded-xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer group disabled:opacity-50"
              >
                <span className="text-xs text-[#DC2626] font-bold tracking-wider uppercase">Again</span>
                <span className="text-lg font-black text-red-600 mt-1">1</span>
                <span className="text-[10px] text-gray-400 mt-1">Incorrect / &lt;1d</span>
              </button>

              {/* HARD button */}
              <button
                disabled={isSubmitting}
                onClick={(e) => { e.stopPropagation(); onRate('Hard'); }}
                className="bg-white hover:bg-amber-50 border border-amber-200 hover:border-amber-500 rounded-xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer group disabled:opacity-50"
              >
                <span className="text-xs text-amber-600 font-bold tracking-wider uppercase">Hard</span>
                <span className="text-lg font-black text-amber-500 mt-1">2</span>
                <span className="text-[10px] text-gray-400 mt-1">Struggled / 2-3d</span>
              </button>

              {/* GOOD button */}
              <button
                disabled={isSubmitting}
                onClick={(e) => { e.stopPropagation(); onRate('Good'); }}
                className="bg-white hover:bg-blue-50 border border-blue-200 hover:border-[#38BDF8] rounded-xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer group disabled:opacity-50"
              >
                <span className="text-xs text-[#075985] font-bold tracking-wider uppercase">Good</span>
                <span className="text-lg font-black text-[#075985] mt-1">3</span>
                <span className="text-[10px] text-gray-400 mt-1">Correct / 4-5d</span>
              </button>

              {/* EASY button */}
              <button
                disabled={isSubmitting}
                onClick={(e) => { e.stopPropagation(); onRate('Easy'); }}
                className="bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer group disabled:opacity-50"
              >
                <span className="text-xs text-emerald-600 font-bold tracking-wider uppercase">Easy</span>
                <span className="text-lg font-black text-emerald-500 mt-1">4</span>
                <span className="text-[10px] text-gray-400 mt-1">Instant / 10d+</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
