import { Course } from '@/types/medical';
import { MOCK_COURSES } from '@/lib/mock/data';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export interface CourseFilters {
  specialty?: string;
  level?: string;
  maxPrice?: number;
  search?: string;
  sort?: 'popular' | 'newest' | 'rating' | 'price-asc' | 'price-desc';
}

export async function getCourses(filters: CourseFilters = {}): Promise<Course[]> {
  await delay();
  let results = [...MOCK_COURSES];

  if (filters.specialty) results = results.filter((c) => c.specialty === filters.specialty);
  if (filters.level) results = results.filter((c) => c.level === filters.level);
  if (filters.maxPrice) results = results.filter((c) => c.price <= filters.maxPrice!);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (c) => c.title.toLowerCase().includes(q) || c.specialty.toLowerCase().includes(q),
    );
  }

  if (filters.sort === 'popular') results.sort((a, b) => b.studentCount - a.studentCount);
  else if (filters.sort === 'rating') results.sort((a, b) => b.rating - a.rating);
  else if (filters.sort === 'price-asc') results.sort((a, b) => a.price - b.price);
  else if (filters.sort === 'price-desc') results.sort((a, b) => b.price - a.price);

  return results;
}

export async function getCourse(id: string): Promise<Course | null> {
  await delay();
  return MOCK_COURSES.find((c) => c.id === id || c.slug === id) ?? null;
}

export async function getEnrolledCourses(): Promise<Course[]> {
  await delay();
  return MOCK_COURSES.filter((c) => c.enrolled);
}

export async function enrollCourse(courseId: string): Promise<{ success: boolean }> {
  await delay(500);
  const course = MOCK_COURSES.find((c) => c.id === courseId);
  if (course) course.enrolled = true;
  return { success: true };
}
