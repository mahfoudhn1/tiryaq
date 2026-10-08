import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getInstructorStats, getInstructorCourses } from '@/api/instructor';
import type { Course } from '@/types/medical';
import { Screen } from '@/components/layout/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useTheme, spacing, radius, fontSize } from '@/theme';
import { useTranslation } from '@/i18n';
import { formatCurrency, formatNumber } from '@/lib/format';

export default function InstructorDashboardScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const { data: stats, isLoading } = useQuery({ queryKey: ['instructor-stats'], queryFn: getInstructorStats });
  const { data: courses = [] } = useQuery({ queryKey: ['instructor-courses'], queryFn: getInstructorCourses });

  const actions: { labelKey: 'createCourse' | 'scheduleLive' | 'completeOnboarding'; descKey: 'createCourseDesc' | 'scheduleLiveDesc' | 'completeOnboardingDesc'; icon: IconName }[] = [
    { labelKey: 'createCourse', descKey: 'createCourseDesc', icon: 'BookOpen' },
    { labelKey: 'scheduleLive', descKey: 'scheduleLiveDesc', icon: 'Video' },
    { labelKey: 'completeOnboarding', descKey: 'completeOnboardingDesc', icon: 'GraduationCap' },
  ];

  return (
    <Screen title={t('welcomeInstructor')} subtitle={t('instructorSubtitle')}>
      <View style={styles.actionsRow}>
        <Button title={t('viewAll')} variant="secondary" size="sm" icon="BookOpen" />
        <Button title={t('totalRevenue')} size="sm" icon="DollarSign" />
      </View>

      {isLoading || !stats ? (
        <View style={styles.grid}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} style={{ height: 108, flex: 1 }} />
          ))}
        </View>
      ) : (
        <>
          <View style={styles.grid}>
            <StatCard label={t('totalRevenue')} value={formatCurrency(stats.totalRevenue)} icon="DollarSign" tint="green" trend="12%" trendUp />
            <StatCard label={t('monthlyRevenue')} value={formatCurrency(stats.monthlyRevenue)} icon="TrendingUp" tint="teal" />
            <StatCard label={t('totalStudents')} value={formatNumber(stats.totalStudents)} icon="Users" tint="blue" />
            <StatCard label={t('enrollments')} value={formatNumber(stats.totalEnrollments)} icon="GraduationCap" tint="purple" />
            <StatCard label={t('completionRate')} value={`${stats.completionRate}%`} icon="Activity" tint="amber" progress={stats.completionRate} />
            <StatCard label={t('averageRating')} value={stats.avgRating} detail={`${t('of')} 5`} icon="Star" tint="amber" />
          </View>

          <SectionHeader
            title={t('yourCourses')}
            right={<Text style={[styles.link, { color: colors.primary }]}>{t('viewAll')}</Text>}
          />
          <View style={{ marginBottom: spacing.xl, gap: spacing.md }}>
            {courses.map((course: Course) => (
              <GlassCard key={course.id} padding={14}>
                <View style={styles.courseRow}>
                  <View style={[styles.courseIcon, { backgroundColor: colors.primarySoft }]}>
                    <Icon name="BookOpen" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.courseInfo}>
                    <View style={styles.courseTitleRow}>
                      <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={1}>
                        {course.title}
                      </Text>
                      <Badge variant="green">{t('published')}</Badge>
                    </View>
                    <View style={styles.courseMeta}>
                      <Meta icon="Users" text={`${formatNumber(course.studentCount)} ${t('students')}`} />
                      <Meta icon="Star" text={String(course.rating)} />
                      <Meta icon="BookOpen" text={`${course.lessonCount} ${t('lessons')}`} />
                      <Meta icon="DollarSign" text={formatCurrency(course.price)} />
                    </View>
                  </View>
                  <Button title={t('edit')} variant="secondary" size="sm" />
                </View>
              </GlassCard>
            ))}
          </View>
        </>
      )}

      <SectionHeader title={t('quickActions')} />
      <View style={styles.quickGrid}>
        {actions.map((action) => (
          <Pressable key={action.labelKey} style={styles.quickItem}>
            <GlassCard padding={14} style={styles.quickCard}>
              <View style={[styles.quickIcon, { backgroundColor: colors.primarySoft }]}>
                <Icon name={action.icon} size={20} color={colors.primary} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.text }]}>{t(action.labelKey)}</Text>
              <Text style={[styles.quickDesc, { color: colors.textMuted }]}>{t(action.descKey)}</Text>
            </GlassCard>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

function Meta({ icon, text }: { icon: IconName; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.metaItem}>
      <Icon name={icon} size={12} color={colors.textSubtle} />
      <Text style={[styles.metaText, { color: colors.textMuted }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  link: { fontSize: fontSize.sm, fontWeight: '700' },
  courseRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  courseIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseInfo: { flex: 1 },
  courseTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  courseTitle: { fontSize: fontSize.md, fontWeight: '700', flexShrink: 1 },
  courseMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: fontSize.xs },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  quickItem: { flexGrow: 1, flexBasis: 150 },
  quickCard: { alignItems: 'flex-start' },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickLabel: { fontSize: fontSize.md, fontWeight: '700' },
  quickDesc: { fontSize: fontSize.sm, marginTop: 3, lineHeight: 17 },
});
