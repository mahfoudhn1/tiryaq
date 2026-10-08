import { apiGet, apiPost } from './client';
import { Course, CourseReview, LessonContext } from '@/types/medical';

export interface CourseFilters {
  specialty?: string;
  level?: string;
  maxPrice?: number;
  search?: string;
  sort?: 'popular' | 'newest' | 'rating' | 'price-asc' | 'price-desc';
}

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

export function getCourse(id: string): Promise<Course | null> {
  return apiGet<Course>(`/api/courses/${id}/`).catch(() => null);
}

export function getCourseReviews(courseId: string): Promise<CourseReview[]> {
  return apiGet<CourseReview[]>(`/api/courses/${courseId}/reviews/`);
}

export function getEnrolledCourses(): Promise<Course[]> {
  return apiGet<Course[]>('/api/enrollments/');
}

export function enrollCourse(courseId: string): Promise<{ success: boolean; course: Course }> {
  return apiPost<{ success: boolean; course: Course }>(`/api/courses/${courseId}/enroll/`);
}

export function getLesson(lessonId: string): Promise<LessonContext> {
  return apiGet<LessonContext>(`/api/lessons/${lessonId}/`);
}

export function completeLesson(
  lessonId: string,
): Promise<{ success: boolean; progress: number }> {
  return apiPost<{ success: boolean; progress: number }>(`/api/lessons/${lessonId}/complete/`);
}
