import { apiGet, apiPost } from './client';
import { AdminCourse, AdminStats, InstructorApplication } from '@/types/medical';

export function getAdminStats(): Promise<AdminStats> {
  return apiGet<AdminStats>('/api/admin/stats/');
}

export function getInstructorApplications(params: {
  status?: string;
  search?: string;
} = {}): Promise<InstructorApplication[]> {
  return apiGet<InstructorApplication[]>('/api/admin/instructor-applications/', {
    query: params,
  });
}

export function approveInstructor(id: string): Promise<InstructorApplication> {
  return apiPost<InstructorApplication>(`/api/admin/instructor-applications/${id}/approve/`);
}

export function rejectInstructor(id: string): Promise<InstructorApplication> {
  return apiPost<InstructorApplication>(`/api/admin/instructor-applications/${id}/reject/`);
}

export function getCourseModeration(
  params: { status?: string } = {},
): Promise<AdminCourse[]> {
  return apiGet<AdminCourse[]>('/api/admin/courses/', { query: params });
}

export function approveCourse(id: string): Promise<AdminCourse> {
  return apiPost<AdminCourse>(`/api/admin/courses/${id}/approve/`);
}

export function rejectCourse(id: string): Promise<AdminCourse> {
  return apiPost<AdminCourse>(`/api/admin/courses/${id}/reject/`);
}

export function archiveCourse(id: string): Promise<AdminCourse> {
  return apiPost<AdminCourse>(`/api/admin/courses/${id}/archive/`);
}
