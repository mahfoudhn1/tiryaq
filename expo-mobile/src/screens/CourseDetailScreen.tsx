import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { getCourse, enrollCourse } from '@/api/courses';
import type { Lesson } from '@/types/medical';
import { Screen } from '@/components/layout/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useTheme, spacing, radius, fontSize, fontWeight, letterSpacing } from '@/theme';
import { useTranslation } from '@/i18n';
import { formatCurrency, formatNumber } from '@/lib/format';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type CourseRoute = RouteProp<RootStackParamList, 'CourseDetail'>;
const LEVEL_TINT: Record<string, 'green' | 'amber' | 'red'> = {
  Beginner: 'green',
  Intermediate: 'amber',
  Advanced: 'red',
};

export default function CourseDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<CourseRoute>();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', route.params.id],
    queryFn: () => getCourse(route.params.id),
  });

  const enroll = useMutation({
    mutationFn: (id: string) => enrollCourse(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course', route.params.id] }),
  });

  if (isLoading) {
    return (
      <Screen>
        <Skeleton style={{ height: 150, marginBottom: spacing.lg }} />
        <Skeleton style={{ height: 28, width: '70%', marginBottom: spacing.md }} />
        <Skeleton style={{ height: 120 }} />
      </Screen>
    );
  }

  if (!course) {
    return (
      <Screen>
        <EmptyState
          icon="BookOpen"
          title={t('noCoursesFound')}
          description={t('adjustFilters')}
          actionLabel={t('goBack')}
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  const enrolled = course.enrolled;

  return (
    <Screen title={course.title} subtitle={course.instructor?.name}>
      <Reveal>
        <LinearGradient
          colors={colors.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.thumb}
        >
          <View
            pointerEvents="none"
            style={[styles.thumbOrb, { backgroundColor: colors.heroSurface }]}
          />
          <LinearGradient
            colors={colors.heroShine}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
          />
          <Icon name="BookOpen" size={40} color={colors.onHero} />
          <View style={styles.thumbBadges}>
            <Badge variant={LEVEL_TINT[course.level] ?? 'slate'}>{course.level}</Badge>
            <Badge variant="primary">{course.specialty}</Badge>
          </View>
        </LinearGradient>
      </Reveal>

      <Reveal delay={60}>
        <GlassCard padding={16} style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.text }]}>{formatCurrency(course.price)}</Text>
            {course.originalPrice ? (
              <Text style={[styles.original, { color: colors.textSubtle }]}>
                {formatCurrency(course.originalPrice)}
              </Text>
            ) : null}
          </View>

          <View style={styles.statsRow}>
            <Stat icon="Star" value={String(course.rating)} label={t('sortRating')} />
            <Stat icon="Users" value={formatNumber(course.studentCount)} label={t('students')} />
            <Stat icon="Clock" value={course.duration} label={t('navCourses')} />
            <Stat icon="BookOpen" value={String(course.lessonCount)} label={t('lessons')} />
          </View>

          {enrolled ? (
            <View style={styles.progressBlock}>
              <View style={styles.progressTop}>
                <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                  {t('progressLabel')}
                </Text>
                <Text style={[styles.progressValue, { color: colors.text }]}>
                  {course.progress ?? 0}%
                </Text>
              </View>
              <ProgressBar value={course.progress ?? 0} />
            </View>
          ) : (
            <Button
              title={course.price > 0 ? `${t('enrollFor')} ${formatCurrency(course.price)}` : t('enrollFree')}
              icon="ArrowRight"
              size="lg"
              fullWidth
              loading={enroll.isPending}
              style={styles.enroll}
              onPress={() => enroll.mutate(course.id)}
            />
          )}
        </GlassCard>
      </Reveal>

      <Reveal delay={120}>
        <SectionHeader title={t('courseContent')} />
        {course.modules.map((module) => (
          <GlassCard key={module.id} variant="flat" padding={16} style={styles.module}>
            <Text style={[styles.moduleTitle, { color: colors.text }]}>{module.title}</Text>
            {module.lessons.map((lesson: Lesson) => (
              <View key={lesson.id} style={[styles.lesson, { borderBottomColor: colors.border }]}>
                <View style={[styles.lessonIcon, { backgroundColor: colors.primarySoft }]}>
                  <Icon name={lessonIcon(lesson.type)} size={14} color={colors.primary} />
                </View>
                <View style={styles.lessonText}>
                  <Text style={[styles.lessonTitle, { color: colors.text }]} numberOfLines={2}>
                    {lesson.title}
                  </Text>
                  <Text style={[styles.lessonMeta, { color: colors.textSubtle }]}>
                    {lesson.duration}
                  </Text>
                </View>
                <Badge variant={lesson.free ? 'green' : 'slate'}>
                  {lesson.free ? t('free') : t('premium')}
                </Badge>
              </View>
            ))}
          </GlassCard>
        ))}

        {course.description ? (
          <GlassCard padding={16}>
            <Text style={[styles.moduleTitle, { color: colors.text }]}>{t('about')}</Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>{course.description}</Text>
          </GlassCard>
        ) : null}
      </Reveal>
    </Screen>
  );
}

function lessonIcon(type: Lesson['type']): IconName {
  if (type === 'video') return 'Play';
  if (type === 'quiz') return 'ClipboardCheck';
  return 'BookOpen';
}

function Stat({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.stat}>
      <Icon name={icon} size={15} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSubtle }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  thumb: {
    height: 150,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  thumbOrb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -80,
    right: -60,
  },
  thumbBadges: { flexDirection: 'row', gap: 8, position: 'absolute', top: 14, left: 14 },
  priceCard: { marginBottom: spacing.lg },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  price: {
    fontSize: 28,
    fontWeight: fontWeight.heavy,
    letterSpacing: letterSpacing.display,
    fontVariant: ['tabular-nums'],
  },
  original: { fontSize: fontSize.md, textDecorationLine: 'line-through' },
  statsRow: { flexDirection: 'row', marginTop: spacing.md, gap: 6 },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: fontSize.md, fontWeight: fontWeight.bold, fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: fontSize.xs, textAlign: 'center' },
  progressBlock: { marginTop: spacing.md },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  progressLabel: { fontSize: fontSize.sm },
  progressValue: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, fontVariant: ['tabular-nums'] },
  enroll: { marginTop: spacing.md },
  module: { marginBottom: spacing.md },
  moduleTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: 8 },
  lesson: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  lessonIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonText: { flex: 1 },
  lessonTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  lessonMeta: { fontSize: fontSize.xs, marginTop: 2 },
  description: { fontSize: fontSize.md, lineHeight: 21 },
});
