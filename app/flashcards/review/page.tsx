import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import FlashcardContainer from '@/components/flashcards/FlashcardContainer';

export default function FlashcardsReviewPage() {
  return (
    <AppShell title="Flashcards">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#0B192C]">
              Spaced Repetition Review
            </h1>

            <p className="mt-1 text-sm text-[#64748B]">
              Rate each card for optimal retention scheduling
            </p>
          </div>

          <Link
            href="/dashboard"
            className="hidden items-center gap-2 text-sm font-semibold text-[#64748B] transition-colors hover:text-[#0B192C] sm:flex"
          >
            <span>← Back to Dashboard</span>
          </Link>
        </div>

        <FlashcardContainer />
      </div>
    </AppShell>
  );
}