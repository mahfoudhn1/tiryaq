import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getCourses, type CourseFilters } from '@/api/courses';
import type { Course } from '@/types/medical';
import { Screen } from '@/components/layout/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Reveal } from '@/components/ui/Reveal';
import { PressableScale } from '@/components/ui/PressableScale';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { useTheme, spacing, radius, fontSize, fontWeight, letterSpacing } from '@/theme';
import { useTranslation } from '@/i18n';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { RootStackParamList, StudentTabParamList } from '@/navigation/AppNavigator';

type CoursesNav = CompositeNavigationProp<
  BottomTabNavigationProp<StudentTabParamList, 'CoursesTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const SPECIALTIES = ['All', 'Cardiology', 'Neurology', 'Nephrology', 'Emergency Medicine', 'Internal Medicine'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const LEVEL_TINT: Record<string, 'green' | 'amber' | 'red'> = {
  Beginner: 'green',
  Intermediate: 'amber',
  Advanced: 'red',
};

function CourseCardItem({ course, onPress }: { course: Course; onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <PressableScale onPress={onPress} style={styles.cardWrap} accessibilityLabel={course.title}>
      <GlassCard variant="flat" padding={14}>
        <View style={styles.courseRow}>
          <View style={[styles.thumb, { backgroundColor: colors.primarySoft }]}>
            <Icon name="BookOpen" size={22} color={colors.primary} />
          </View>
          <View style={styles.courseInfo}>
            <View style={styles.badgeRow}>
              <Badge variant={LEVEL_TINT[course.level] ?? 'slate'}>{course.level}</Badge>
              <Text style={[styles.specialty, { color: colors.textSubtle }]} numberOfLines={1}>
                {course.specialty}
              </Text>
            </View>
            <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={2}>
              {course.title}
            </Text>
            <Text style={[styles.instructor, { color: colors.textMuted }]} numberOfLines={1}>
              {course.instructor?.name}
            </Text>
          </View>
        </View>

        <View style={[styles.courseFooter, { borderTopColor: colors.border }]}>
          <View style={styles.metaItem}>
            <Icon name="Star" size={13} color={colors.warning} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>{course.rating}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="Users" size={13} color={colors.textSubtle} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {formatNumber(course.studentCount)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="Clock" size={13} color={colors.textSubtle} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>{course.duration}</Text>
          </View>
          <View style={styles.priceBox}>
            {course.originalPrice ? (
              <Text style={[styles.originalPrice, { color: colors.textSubtle }]}>
                {formatCurrency(course.originalPrice)}
              </Text>
            ) : null}
            <Text style={[styles.price, { color: colors.text }]}>{formatCurrency(course.price)}</Text>
          </View>
        </View>
      </GlassCard>
    </PressableScale>
  );
}

export default function CoursesScreen() {
  const navigation = useNavigation<CoursesNav>();
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [level, setLevel] = useState('All');
  const [sort, setSort] = useState<NonNullable<CourseFilters['sort']>>('popular');

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

  const clear = () => {
    setSearch('');
    setSpecialty('All');
    setLevel('All');
    setSort('popular');
  };

  const sorts: { key: NonNullable<CourseFilters['sort']>; label: string }[] = [
    { key: 'popular', label: t('sortPopular') },
    { key: 'rating', label: t('sortRating') },
    { key: 'price-asc', label: t('sortPriceAsc') },
    { key: 'price-desc', label: t('sortPriceDesc') },
  ];

  const hasFilters = Boolean(search) || specialty !== 'All' || level !== 'All';

  return (
    <Screen title={t('findCourse')} subtitle={t('coursesSubtitle')}>
      <Reveal>
        <Input
          icon="Search"
          value={search}
          onChangeText={setSearch}
          placeholder={t('searchCourses')}
          style={styles.search}
        />

        <ChipRow style={styles.chipRow}>
          {SPECIALTIES.map((option) => (
            <Chip
              key={option}
              label={option}
              active={specialty === option}
              onPress={() => setSpecialty(option)}
            />
          ))}
        </ChipRow>

        <ChipRow style={styles.chipRow}>
          {LEVELS.map((option) => (
            <Chip
              key={option}
              label={option}
              active={level === option}
              onPress={() => setLevel(option)}
            />
          ))}
        </ChipRow>

        <ChipRow style={styles.chipRow}>
          {sorts.map((option) => (
            <Chip
              key={option.key}
              label={option.label}
              active={sort === option.key}
              icon={sort === option.key ? 'Check' : undefined}
              onPress={() => setSort(option.key)}
            />
          ))}
        </ChipRow>

        {hasFilters ? (
          <Button
            title={t('clearFilters')}
            variant="ghost"
            size="sm"
            icon="X"
            onPress={clear}
            style={styles.clear}
          />
        ) : null}
      </Reveal>

      <Reveal delay={60}>
        <SectionHeader title={`${courses.length} ${t('navCourses')}`} />

        {isLoading ? (
          <View style={styles.list}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} style={{ height: 116 }} />
            ))}
          </View>
        ) : courses.length === 0 ? (
          <EmptyState
            icon="Search"
            title={t('noCoursesFound')}
            description={t('adjustFilters')}
            actionLabel={t('clearFilters')}
            onAction={clear}
          />
        ) : (
          courses.map((course: Course) => (
            <CourseCardItem
              key={course.id}
              course={course}
              onPress={() => navigation.navigate('CourseDetail', { id: course.id })}
            />
          ))
        )}
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { marginBottom: spacing.md },
  chipRow: { marginBottom: spacing.sm },
  clear: { marginBottom: spacing.lg },
  cardWrap: { marginBottom: spacing.md },
  courseRow: { flexDirection: 'row', gap: 12 },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseInfo: { flex: 1, gap: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  specialty: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, flex: 1 },
  courseTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, lineHeight: 19, letterSpacing: letterSpacing.tight },
  instructor: { fontSize: fontSize.sm },
  courseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: fontSize.sm, fontVariant: ['tabular-nums'] },
  priceBox: { marginLeft: 'auto', alignItems: 'flex-end' },
  originalPrice: { fontSize: fontSize.xs, textDecorationLine: 'line-through' },
  price: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, fontVariant: ['tabular-nums'] },
  list: { gap: spacing.md },
});
