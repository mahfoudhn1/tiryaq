'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { CourseCard } from '@/components/courses/CourseCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { getCourses, CourseFilters } from '@/lib/api/courses';
import { cn } from '@/lib/utils/cn';
import { useLocale } from '@/lib/i18n/useLocale';

const SPECIALTIES = [['All', 'all'], ['Cardiology', 'Cardiology'], ['Neurology', 'Neurology'], ['Nephrology', 'Nephrology'], ['Emergency Medicine', 'Emergency Medicine'], ['Internal Medicine', 'Internal Medicine']] as const;
const LEVELS = [['All', 'all'], ['Beginner', 'beginner'], ['Intermediate', 'intermediate'], ['Advanced', 'advanced']] as const;
const SORTS = [
  { value: 'popular', label: 'mostPopular' },
  { value: 'rating', label: 'highestRated' },
  { value: 'price-asc', label: 'priceLowToHigh' },
  { value: 'price-desc', label: 'priceHighToLow' },
] as const;

export default function CoursesPage() {
  const { t } = useLocale();
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [level, setLevel] = useState('All');
  const [sort, setSort] = useState<CourseFilters['sort']>('popular');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters: CourseFilters = {
    search: search || undefined,
    specialty: specialty !== 'All' ? specialty : undefined,
    level: level !== 'All' ? level : undefined,
    sort,
  };

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', filters],
    queryFn: () => getCourses(filters),
  });

  const clearFilters = () => { setSearch(''); setSpecialty('All'); setLevel('All'); setSort('popular'); };
  const hasFilters = search || specialty !== 'All' || level !== 'All';

  return (
    <AppShell title={t('courseMarketplace')}>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {/* Page header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#075985]">{t('tutorMarketplace')}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#0F2A3D]">{t('findYourNextCourse')}</h1>
          <p className="mt-2 text-[14px] text-[#5B7184]">{t('courseMarketplaceDescription')}</p>
        </div>

        {/* Search + filter bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B7184]" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchCourses')}
              className="w-full rounded-xl border border-[#0369A1]/15 bg-white py-2.5 pl-9 pr-4 text-[13px] text-[#0F2A3D] placeholder:text-[#5B7184] focus:border-[#0369A1] focus:outline-none focus:ring-2 focus:ring-[#0369A1]/20"
              aria-label={t('searchCoursesLabel')}
            />
          </div>

          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={cn('flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-semibold transition-colors sm:hidden', filtersOpen ? 'border-[#0369A1] bg-[#E0F2FE] text-[#0369A1]' : 'border-[#0369A1]/15 bg-white text-[#5B7184]')}
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal size={16} />
            {t('filters')}
          </button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as CourseFilters['sort'])}
            className="rounded-xl border border-[#0369A1]/15 bg-white px-3 py-2.5 text-[13px] font-semibold text-[#0F2A3D] focus:border-[#0369A1] focus:outline-none"
            aria-label={t('sortCourses')}
          >
            {SORTS.map((s) => <option key={s.value} value={s.value}>{t(s.label)}</option>)}
          </select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0 gap-1 text-red-500 hover:text-red-600">
              <X size={14} /> {t('clear')}
            </Button>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className={cn('w-52 shrink-0', filtersOpen ? 'block' : 'hidden sm:block')} aria-label={t('courseFilters')}>
            <div className="sticky top-[84px] space-y-6 rounded-2xl border border-[#0369A1]/15 bg-white/75 p-5 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl">
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5B7184]">{t('specialty')}</p>
                <ul className="space-y-1">
                  {SPECIALTIES.map(([value, label]) => (
                    <li key={value}>
                      <button
                        onClick={() => setSpecialty(value)}
                        className={cn('w-full rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors', specialty === value ? 'bg-[#E0F2FE] font-bold text-[#0369A1]' : 'text-[#5B7184] hover:bg-[#0369A1]/10')}
                        aria-pressed={specialty === value}
                      >
                        {label === 'all' ? t('all') : label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5B7184]">{t('level')}</p>
                <ul className="space-y-1">
                  {LEVELS.map(([value, label]) => (
                    <li key={value}>
                      <button
                        onClick={() => setLevel(value)}
                        className={cn('w-full rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors', level === value ? 'bg-[#E0F2FE] font-bold text-[#0369A1]' : 'text-[#5B7184] hover:bg-[#0369A1]/10')}
                        aria-pressed={level === value}
                      >
                        {t(label)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#0369A1]/15 bg-white/75 py-20 text-center backdrop-blur-xl">
                <p className="text-[15px] font-bold text-[#0F2A3D]">{t('noCoursesFound')}</p>
                <p className="mt-1 text-[13px] text-[#5B7184]">{t('adjustFilters')}</p>
                <Button className="mt-4" onClick={clearFilters}>{t('clearFilters')}</Button>
              </div>
            ) : (
              <>
                <p className="mb-4 text-[12px] text-[#5B7184]">{courses.length} {courses.length === 1 ? t('course') : t('courseCount')}</p>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {courses.map((c) => <CourseCard key={c.id} course={c} />)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
