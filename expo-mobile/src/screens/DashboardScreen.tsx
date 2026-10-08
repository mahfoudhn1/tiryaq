import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { getDashboardSummary } from '@/api/study';
import type { DashboardSummary } from '@/types/medical';
import { Screen } from '@/components/layout/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useTheme, spacing, radius, fontSize, fontWeight, letterSpacing, statusTints, statusSoftTints, type TintName } from '@/theme';
import { useTranslation } from '@/i18n';
import { useAppSelector } from '@/store/hooks';
import type { RootStackParamList, StudentTabParamList } from '@/navigation/AppNavigator';

type DashboardNav = CompositeNavigationProp<
  BottomTabNavigationProp<StudentTabParamList, 'DashboardTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type SuiteRoute = 'FlashcardReview' | 'CasesTab' | 'QBankTab' | 'AnalyticsTab' | 'LiveSessionDetail';

interface Suite {
  titleKey: 'spacedRepetition' | 'clinicalCases' | 'qbankPractice' | 'performance' | 'liveTitle';
  descKey: 'spacedRepetitionDesc' | 'clinicalCasesDesc' | 'qbankPracticeDesc' | 'performanceDesc' | 'liveSubtitle';
  icon: IconName;
  tint: TintName;
  route: SuiteRoute;
}

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNav>();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  });

  const firstName = user?.name?.split(' ')[0] ?? '';

  const go = (route: SuiteRoute) => {
    switch (route) {
      case 'FlashcardReview':
        navigation.navigate('FlashcardReview');
        break;
      case 'CasesTab':
        navigation.navigate('CasesTab');
        break;
      case 'QBankTab':
        navigation.navigate('QBankTab');
        break;
      case 'AnalyticsTab':
        navigation.navigate('AnalyticsTab');
        break;
      case 'LiveSessionDetail':
        navigation.navigate('LiveSessionDetail', { id: '' });
        break;
    }
  };

  if (isLoading) {
    return (
      <Screen title={t('navDashboard')}>
        <Skeleton style={{ height: 168, marginBottom: spacing.lg }} />
        <View style={styles.grid}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} style={{ height: 108, flex: 1 }} />
          ))}
        </View>
        <Skeleton style={{ height: 200, marginTop: spacing.lg }} />
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen title={t('navDashboard')}>
        <EmptyState
          icon="CircleAlert"
          title={t('error')}
          description={t('noActivity')}
          actionLabel={t('retry')}
          onAction={() => refetch()}
        />
      </Screen>
    );
  }

  const summary: DashboardSummary = data;
  const progress = summary.dailyGoal
    ? Math.round((summary.dailyCompleted / summary.dailyGoal) * 100)
    : 0;
  const scheme = isDark ? 'dark' : 'light';

  const suites: Suite[] = [
    { titleKey: 'spacedRepetition', descKey: 'spacedRepetitionDesc', icon: 'Brain', tint: 'teal', route: 'FlashcardReview' },
    { titleKey: 'clinicalCases', descKey: 'clinicalCasesDesc', icon: 'Stethoscope', tint: 'blue', route: 'CasesTab' },
    { titleKey: 'qbankPractice', descKey: 'qbankPracticeDesc', icon: 'ClipboardCheck', tint: 'purple', route: 'QBankTab' },
    { titleKey: 'performance', descKey: 'performanceDesc', icon: 'BarChart3', tint: 'amber', route: 'AnalyticsTab' },
    { titleKey: 'liveTitle', descKey: 'liveSubtitle', icon: 'Video', tint: 'red', route: 'LiveSessionDetail' },
  ];

  return (
    <Screen title={`${t('goodMorning')}, ${firstName}`} subtitle={t('yourClinicalEdge')}>
      <Reveal>
        <LinearGradient
          colors={colors.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View
            pointerEvents="none"
            style={[styles.heroOrbLarge, { backgroundColor: colors.heroSurface }]}
          />
          <View
            pointerEvents="none"
            style={[styles.heroOrbSmall, { backgroundColor: colors.heroBorder }]}
          />
          <LinearGradient
            colors={colors.heroShine}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
          />

          <View style={[styles.heroBadge, { backgroundColor: colors.heroSurface, borderColor: colors.heroBorder }]}>
            <Icon name="Sparkles" size={13} color={colors.onHero} />
            <Text style={[styles.heroBadgeText, { color: colors.onHero }]}>
              {t('yourClinicalEdge').toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.onHero }]}>
            {summary.dueFlashcardsCount} {t('dueFlashcards').toLowerCase()}
          </Text>
          <Text style={[styles.heroText, { color: colors.onHeroMuted }]}>
            {t('readyForReview')} · {summary.streakDays} {t('dayStreak').toLowerCase()}
          </Text>

          <View style={styles.heroProgressRow}>
            <Text style={[styles.heroProgressLabel, { color: colors.onHeroMuted }]}>
              {t('todaysFocus')}
            </Text>
            <Text style={[styles.heroProgressValue, { color: colors.onHero }]}>{progress}%</Text>
          </View>
          <View style={[styles.heroTrack, { backgroundColor: colors.heroTrack }]}>
            <View
              style={[
                styles.heroFill,
                { width: `${Math.min(100, progress)}%`, backgroundColor: colors.onHero },
              ]}
            />
          </View>
        </LinearGradient>
      </Reveal>

      <Reveal delay={60}>
        <View style={styles.grid}>
          <StatCard
            label={t('dailyGoal')}
            value={`${summary.dailyCompleted}/${summary.dailyGoal}`}
            detail={t('cardsCompleted')}
            icon="Target"
            tint="teal"
            progress={progress}
          />
          <StatCard
            label={t('studyStreak')}
            value={summary.streakDays}
            detail={t('consecutiveDays')}
            icon="Flame"
            tint="amber"
          />
          <StatCard
            label={t('dueFlashcards')}
            value={summary.dueFlashcardsCount}
            detail={t('readyForReview')}
            icon="Brain"
            tint="blue"
            onPress={() => navigation.navigate('FlashcardReview')}
          />
          <StatCard
            label={t('activeCases')}
            value={summary.dueCasesCount}
            detail={t('clinicalSimulations')}
            icon="Stethoscope"
            tint="purple"
            onPress={() => navigation.navigate('CasesTab')}
          />
        </View>
      </Reveal>

      <Reveal delay={120}>
        <SectionHeader title={t('studySuites')} />
        <GlassCard padding={6}>
          {suites.map((suite, index) => {
            const accent = statusTints[suite.tint][scheme];
            const soft = statusSoftTints[suite.tint][scheme];
            return (
              <Pressable
                key={suite.titleKey}
                onPress={() => go(suite.route)}
                style={({ pressed }) => [
                  styles.suiteRow,
                  index < suites.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  pressed && styles.rowPressed,
                ]}
              >
                <View style={[styles.suiteIcon, { backgroundColor: soft }]}>
                  <Icon name={suite.icon} size={19} color={accent} strokeWidth={2.2} />
                </View>
                <View style={styles.suiteText}>
                  <Text style={[styles.suiteTitle, { color: colors.text }]}>{t(suite.titleKey)}</Text>
                  <Text style={[styles.suiteDesc, { color: colors.textMuted }]} numberOfLines={1}>
                    {t(suite.descKey)}
                  </Text>
                </View>
                <Icon name="ChevronRight" size={18} color={colors.textSubtle} />
              </Pressable>
            );
          })}
        </GlassCard>
      </Reveal>

      <Reveal delay={170}>
        <SectionHeader title={t('recentActivity')} />
        <GlassCard padding={16}>
          {summary.recentActivity.length === 0 ? (
            <Text style={[styles.emptyActivity, { color: colors.textMuted }]}>{t('noActivity')}</Text>
          ) : (
            summary.recentActivity.slice(0, 5).map((activity, index) => (
              <View
                key={activity.id}
                style={[
                  styles.activityRow,
                  index < Math.min(summary.recentActivity.length, 5) - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={[styles.activityDot, { backgroundColor: colors.primarySoft }]}>
                  <Icon
                    name={activity.type === 'case' ? 'Stethoscope' : activity.type === 'quiz' ? 'ClipboardCheck' : 'Brain'}
                    size={15}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.activityText}>
                  <Text style={[styles.activityTitle, { color: colors.text }]} numberOfLines={1}>
                    {activity.title}
                  </Text>
                  <Text style={[styles.activityTime, { color: colors.textMuted }]}>{activity.status}</Text>
                </View>
              </View>
            ))
          )}
        </GlassCard>
      </Reveal>

      <Reveal delay={220}>
        <Button
          title={t('startReview')}
          icon="Play"
          size="lg"
          fullWidth
          style={styles.cta}
          onPress={() => navigation.navigate('FlashcardReview')}
        />
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  heroOrbLarge: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -70,
    right: -50,
  },
  heroOrbSmall: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    bottom: -50,
    right: 70,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.micro,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: fontWeight.heavy,
    letterSpacing: letterSpacing.title,
    marginTop: 14,
  },
  heroText: { fontSize: fontSize.md, marginTop: 6 },
  heroProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  heroProgressLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  heroProgressValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  heroTrack: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  heroFill: { height: '100%', borderRadius: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  suiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 60,
    paddingVertical: 13,
    paddingHorizontal: 10,
  },
  suiteIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suiteText: { flex: 1 },
  suiteTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  suiteDesc: { fontSize: fontSize.sm, marginTop: 2 },
  rowPressed: { opacity: 0.7 },
  emptyActivity: { fontSize: fontSize.md, textAlign: 'center', paddingVertical: 10 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  activityDot: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: { flex: 1 },
  activityTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  activityTime: { fontSize: fontSize.sm, marginTop: 1 },
  cta: { marginTop: spacing.lg },
});
