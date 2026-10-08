"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { getQuizDeck } from "@/services/studyService";
import { QuizQuestion } from "@/types/medical";

export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const quizData = await getQuizDeck();
        setQuestions(quizData);
      } catch (error) {
        console.error("Failed to load quiz questions:", error);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleAnswerSelect = (optionIndex: number) => {
    if (answered) return;
    setSelectedAnswer(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setAnswered(true);

    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setAnswered(false);
      setScore(0);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    }
  };

  const getScoreColor = () => {
    const percentage = (score / (currentIndex + 1)) * 100;

    if (percentage >= 90) return "text-emerald-600";
    if (percentage >= 70) return "text-[#3B82F6]";
    if (percentage >= 50) return "text-amber-600";

    return "text-[#FF5A5F]";
  };

  if (loading) {
    return (
      <AppShell title="QBank Quiz">
        <div className="mx-auto max-w-3xl animate-pulse px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 h-8 w-1/4 rounded bg-gray-200" />
          <div className="mb-6 h-64 rounded-xl bg-gray-200" />
          <div className="h-32 rounded-xl bg-gray-200" />
        </div>
      </AppShell>
    );
  }

  if (questions.length === 0) {
    return (
      <AppShell title="QBank Quiz">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#0B192C]">
              No Quiz Questions Available
            </h1>

            <p className="mt-2 text-[#64748B]">
              Please check back later for available quiz questions.
            </p>

            <Link
              href="/dashboard"
              className="mt-4 inline-block text-[#3B82F6] hover:underline"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="QBank Quiz">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Bar and Score */}
        <div className="mb-6 rounded-2xl border border-gray-200/60 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Question {currentIndex + 1} of {questions.length}
              </span>

              <div className="h-2 w-32 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-emerald-600 transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className={`text-sm font-bold ${getScoreColor()}`}>
              Score: {score}/{currentIndex + 1}
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="mb-6 rounded-3xl border border-gray-200/60 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600">
                USMLE Step 1 Style
              </span>

              <h2 className="mt-3 text-xl font-black leading-tight text-[#0B192C]">
                {currentQuestion.vignette}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold uppercase text-[#64748B]">
                Yield Rating
              </span>

              <div
                className={`mt-1 text-lg font-black ${
                  currentQuestion.yieldRating === "High"
                    ? "text-[#FF5A5F]"
                    : currentQuestion.yieldRating === "Medium"
                      ? "text-amber-600"
                      : "text-teal-600"
                }`}
              >
                {currentQuestion.yieldRating}
              </div>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = index === currentQuestion.correctAnswer;
              const isSelected = index === selectedAnswer;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={answered}
                  className={`w-full rounded-xl border-2 p-5 text-left transition-all ${
                    answered
                      ? isCorrect
                        ? "border-emerald-500 bg-emerald-50 font-semibold text-emerald-900"
                        : isSelected
                          ? "border-red-500 bg-red-50 font-semibold text-red-900"
                          : "border-gray-200 bg-white text-[#334155]"
                      : isSelected
                        ? "border-[#3B82F6] bg-emerald-50 font-semibold text-[#0B192C]"
                        : "border-gray-200 bg-white text-[#334155] hover:border-gray-300 hover:bg-gray-50"
                  } ${answered ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                        answered
                          ? isCorrect
                            ? "border-emerald-500 bg-emerald-500"
                            : isSelected
                              ? "border-red-500 bg-red-500"
                              : "border-gray-300"
                          : isSelected
                            ? "border-[#3B82F6] bg-emerald-50"
                            : "border-gray-300 bg-white"
                      }`}
                    >
                      {answered && (isCorrect || isSelected) ? (
                        <span className="text-xs font-bold text-white">✓</span>
                      ) : (
                        <span className="text-xs font-semibold text-[#64748B]">
                          {(index + 1).toString().padStart(2, "0")}
                        </span>
                      )}
                    </div>

                    <span className="flex-1">{option}</span>

                    {answered && isCorrect && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-600">
                        CORRECT
                      </span>
                    )}

                    {answered && isSelected && !isCorrect && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                        INCORRECT
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {answered && (
            <div className="mt-8 rounded-xl border border-gray-200/60 bg-[#F4F7FB] p-6">
              <h3 className="mb-2 text-lg font-bold text-[#0B192C]">
                High-Yield Explanation
              </h3>

              <p className="mb-4 leading-relaxed text-[#334155]">
                {currentQuestion.explanation}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#64748B]">
                  Subject: {currentQuestion.subject}
                </span>

                <span
                  className={`rounded-full px-2 py-1 text-xs font-bold ${
                    currentQuestion.yieldRating === "High"
                      ? "border border-[#FF5A5F]/20 bg-[#FF5A5F]/10 text-[#FF5A5F]"
                      : currentQuestion.yieldRating === "Medium"
                        ? "border border-amber-200 bg-amber-50 text-amber-700"
                        : "border border-teal-200 bg-teal-50 text-teal-700"
                  }`}
                >
                  {currentQuestion.yieldRating} Yield
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4">
          <Link
            href="/dashboard"
            className="flex-1 rounded-xl border border-gray-300 bg-white py-4 text-center font-semibold text-[#334155] transition-colors hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>

          {!answered ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="flex-1 rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 rounded-xl bg-[#0B192C] py-4 font-bold text-white shadow-sm transition-colors hover:bg-[#1E2A38]"
            >
              {isLastQuestion ? "Review Quiz" : "Next Question"}
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}