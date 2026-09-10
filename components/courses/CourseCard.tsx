'use client';

import Link from 'next/link';
import { BookOpen, Clock, Star, Users } from 'lucide-react';
import { Course } from '@/types/medical';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import { useLocale } from '@/lib/i18n/useLocale';

interface CourseCardProps {
  course: Course;
}

const BADGE_VARIANT: Record<string, 'teal' | 'amber' | 'blue'> = {
  'Best Seller': 'amber',
  'New': 'teal',
  'Top Rated': 'blue',
};

const LEVEL_VARIANT: Record<string, 'green' | 'amber' | 'red'> = {
  Beginner: 'green',
  Intermediate: 'amber',
  Advanced: 'red',
};

export function CourseCard({ course }: CourseCardProps) {
  const { t } = useLocale();
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col rounded-2xl border border-[#dce7eb] bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:border-[#8ecfd3] hover:shadow-[0_12px_30px_rgba(14,116,144,0.10)]"
    >
      {/* Thumbnail area */}
      <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#e0f7f7] to-[#dbeafe]">
        <BookOpen size={40} className="text-[#0e7490]/40" aria-hidden />
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {course.badges.map((b) => (
            <Badge key={b} variant={BADGE_VARIANT[b] ?? 'slate'}>{b}</Badge>
          ))}
        </div>
        {course.enrolled && (
          <div className="absolute right-3 top-3">
            <Badge variant="green">{t('enrolled')}</Badge>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Badge variant={LEVEL_VARIANT[course.level] ?? 'slate'}>{course.level}</Badge>
          <Badge variant="slate">{course.specialty}</Badge>
        </div>

        <h3 className="mt-3 text-[15px] font-bold leading-5 text-[#0f172a] group-hover:text-[#0e7490]">
          {course.title}
        </h3>

        <p className="mt-1.5 text-[12px] text-[#64748b]">{course.instructor.name}</p>

        {/* Stats row */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#64748b]">
          <span className="flex items-center gap-1">
            <Star size={12} className="fill-amber-400 text-amber-400" aria-hidden />
            <strong className="font-bold text-[#0f172a]">{course.rating}</strong>
            <span>({formatNumber(course.reviewCount)})</span>
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} aria-hidden />
            {formatNumber(course.studentCount)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} aria-hidden />
            {course.duration}
          </span>
          <span>{course.lessonCount} {t('lessons')}</span>
        </div>

        {/* Progress bar for enrolled */}
        {course.enrolled && course.progress !== undefined && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[10px]">
              <span className="text-[#64748b]">{t('progress')}</span>
              <span className="font-bold text-[#0e7490]">{course.progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#e2eaee]">
              <div
                className="h-full rounded-full bg-[#0e7490]"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[18px] font-bold tracking-tight text-[#0f172a]">
              {formatCurrency(course.price)}
            </span>
            {course.originalPrice && (
              <span className="text-[12px] text-[#94a3b8] line-through">
                {formatCurrency(course.originalPrice)}
              </span>
            )}
          </div>
          {course.enrolled ? (
            <span className="rounded-full bg-[#0e7490] px-3 py-1.5 text-[11px] font-bold text-white">
              {t('continue')}
            </span>
          ) : (
            <span className="rounded-full bg-[#0f172a] px-3 py-1.5 text-[11px] font-bold text-white group-hover:bg-[#0e7490]">
              {t('view')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
