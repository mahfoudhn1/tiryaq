import { apiGet } from './client';
import { Course, InstructorStats, Transaction } from '@/types/medical';

export interface InstructorRevenue {
  stats: InstructorStats;
  transactions: Transaction[];
  monthly: { month: string; amount: number }[];
}

export function getInstructorStats(): Promise<InstructorStats> {
  return apiGet<InstructorStats>('/api/instructor/stats/');
}

export function getInstructorCourses(): Promise<Course[]> {
  return apiGet<Course[]>('/api/instructor/courses/');
}

export function getRevenue(): Promise<InstructorRevenue> {
  return apiGet<InstructorRevenue>('/api/instructor/revenue/');
}
