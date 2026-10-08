import type { Metadata } from 'next';
import HomeContent from './HomeContent';

export const metadata: Metadata = {
  title: 'Tiryaq — Med school in Algeria, finally in one place',
  description:
    'Certified courses, a QBank, FSRS flashcards, clinical cases and 34 bedside calculators — built on the Algerian national nomenclature, DCI names and the exams you actually sit.',
  openGraph: {
    title: 'Tiryaq — Med school in Algeria, finally in one place',
    description:
      'Courses, recall, clinical cases and offline bedside tools for Algerian medical students. Built where you will practise.',
    type: 'website',
    locale: 'en',
    siteName: 'Tiryaq',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tiryaq — Med school in Algeria, finally in one place',
    description: 'Courses, recall, clinical cases and offline bedside tools for Algerian medical students.',
  },
};

export default function Home() {
  return <HomeContent />;
}
