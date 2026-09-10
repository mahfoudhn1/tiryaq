import { InstructorStats, Transaction } from '@/types/medical';
import {
  MOCK_INSTRUCTOR_STATS,
  MOCK_TRANSACTIONS,
  MOCK_MONTHLY_REVENUE,
  MOCK_COURSES,
} from '@/lib/mock/data';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function getInstructorStats(): Promise<InstructorStats> {
  await delay();
  return { ...MOCK_INSTRUCTOR_STATS };
}

export async function getInstructorCourses() {
  await delay();
  return MOCK_COURSES.filter((c) => c.instructor.id === 'inst-1');
}

export async function getRevenue(): Promise<{
  stats: InstructorStats;
  transactions: Transaction[];
  monthly: { month: string; amount: number }[];
}> {
  await delay();
  return {
    stats: { ...MOCK_INSTRUCTOR_STATS },
    transactions: [...MOCK_TRANSACTIONS],
    monthly: [...MOCK_MONTHLY_REVENUE],
  };
}
