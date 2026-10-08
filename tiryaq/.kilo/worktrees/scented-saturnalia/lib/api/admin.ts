import { AdminStats, InstructorApplication, AdminCourse } from '@/types/medical';
import {
  MOCK_ADMIN_STATS,
  MOCK_INSTRUCTOR_APPLICATIONS,
  MOCK_ADMIN_COURSES,
} from '@/lib/mock/data';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function getAdminStats(): Promise<AdminStats> {
  await delay();
  return { ...MOCK_ADMIN_STATS };
}

export async function getInstructorApplications(): Promise<InstructorApplication[]> {
  await delay();
  return [...MOCK_INSTRUCTOR_APPLICATIONS];
}

export async function approveInstructor(id: string): Promise<void> {
  await delay(400);
  const app = MOCK_INSTRUCTOR_APPLICATIONS.find((a) => a.id === id);
  if (app) app.status = 'approved';
}

export async function rejectInstructor(id: string): Promise<void> {
  await delay(400);
  const app = MOCK_INSTRUCTOR_APPLICATIONS.find((a) => a.id === id);
  if (app) app.status = 'rejected';
}

export async function getCourseModeration(): Promise<AdminCourse[]> {
  await delay();
  return [...MOCK_ADMIN_COURSES];
}

export async function approveCourse(id: string): Promise<void> {
  await delay(400);
  const course = MOCK_ADMIN_COURSES.find((c) => c.id === id);
  if (course) course.status = 'published';
}

export async function rejectCourse(id: string): Promise<void> {
  await delay(400);
  const course = MOCK_ADMIN_COURSES.find((c) => c.id === id);
  if (course) course.status = 'rejected';
}
