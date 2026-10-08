import { Course, CourseReview, LessonContext } from '@/types/medical';

import { apiGet, apiPost } from './client';

export interface CourseFilters {
  specialty?: string;
  level?: string;
  maxPrice?: number;
  search?: string;
  sort?: 'popular' | 'newest' | 'rating' | 'price-asc' | 'price-desc';
}

/** Marketplace listing, filtered and sorted server-side. */
export function getCourses(filters: CourseFilters = {}): Promise<Course[]> {
  return apiGet<Course[]>('/api/courses/', {
    query: {
      specialty: filters.specialty,
      level: filters.level,
      maxPrice: filters.maxPrice,
      search: filters.search,
      sort: filters.sort,
    },
  });
}

/** Accepts either the course UUID or its slug. */
export function getCourse(id: string): Promise<Course | null> {
  return apiGet<Course>(`/api/courses/${id}/`).catch(() => null);
}

export function getCourseReviews(courseId: string): Promise<CourseReview[]> {
  return apiGet<CourseReview[]>(`/api/courses/${courseId}/reviews/`);
}

/** Courses the signed-in learner is enrolled in. */
export function getEnrolledCourses(): Promise<Course[]> {
  return apiGet<Course[]>('/api/enrollments/');
}

export function enrollCourse(courseId: string): Promise<{ success: boolean; course: Course }> {
  return apiPost<{ success: boolean; course: Course }>(`/api/courses/${courseId}/enroll/`);
}

/** Lesson player payload: the lesson, its module and the full course outline. */
export function getLesson(lessonId: string): Promise<LessonContext> {
  return apiGet<LessonContext>(`/api/lessons/${lessonId}/`);
}

export function completeLesson(
  lessonId: string,
): Promise<{ success: boolean; progress: number }> {
  return apiPost<{ success: boolean; progress: number }>(`/api/lessons/${lessonId}/complete/`);
}
