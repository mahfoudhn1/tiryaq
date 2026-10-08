import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getStudyAnalytics } from '@/api/study';
import { Screen } from '@/components/layout/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard } from '@/components/ui/StatCard';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme, spacing, fontSize, fontWeight, letterSpacing } from '@/theme';
import { useTranslation } from '@/i18n';

type Tab = 'overview' | 'exam';

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('overview');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics'],
    queryFn: getStudyAnalytics,
  });

  const examMetrics = [
    { key: 'mKnowledge' as const, score: 78 },
    { key: 'mRetention' as const, score: data ? Math.round(data.cardsRetentionRate) : 0 },
    { key: 'mClinical' as const, score: data ? Math.round(data.clinicalCaseSuccessRate) : 0 },
    { key: 'mQuestions' as const, score: data ? Math.round(data.progress.accuracyRate) : 0 },
    { key: 'mConsistency' as const, score: 90 },
  ];
  const overall = Math.round(examMetrics.reduce((a, m) => a + m.score, 0) / examMetrics.length);

  return (
    <Screen title={t('analyticsTitle')} subtitle={t('analyticsSubtitle')}>
      <SegmentedControl<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'overview', label: t('overview') },
          { value: 'exam', label: t('examReadiness') },
        ]}
        style={styles.tabs}
      />

      {isLoading ? (
        <View style={styles.loading}>
          <View style={styles.grid}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} style={{ height: 108, flex: 1 }} />
            ))}
          </View>
          <Skeleton style={{ height: 200 }} />
        </View>
      ) : isError || !data ? (
        <EmptyState
          icon="CircleAlert"
          title={t('error')}
          description={t('noData')}
          actionLabel={t('retry')}
          onAction={() => refetch()}
        />
      ) : tab === 'overview' ? (
        <>
          <Reveal>
            <View style={styles.grid}>
              <StatCard label={t('studyStreak')} value={data.progress.streakDays} detail={t('consecutiveDays')} icon="TrendingUp" tint="teal" />
              <StatCard label={t('accuracy')} value={`${data.progress.accuracyRate.toFixed(1)}%`} icon="Target" tint="blue" progress={data.progress.accuracyRate} />
              <StatCard label={t('hoursStudied')} value={data.totalHoursStudied} icon="Clock" tint="amber" />
              <StatCard label={t('retention')} value={`${data.cardsRetentionRate.toFixed(0)}%`} icon="Activity" tint="green" progress={data.cardsRetentionRate} />
            </View>
          </Reveal>

          <Reveal delay={70}>
            <SectionHeader title={t('subjectMastery')} />
            <GlassCard padding={16} style={styles.sectionCard}>
              {data.progress.subjectMastery.map((s, i) => {
                const color = s.masteryPercent >= 80 ? colors.success : s.masteryPercent >= 65 ? colors.warning : colors.danger;
                return (
                  <View
                    key={s.subject}
                    style={[
                      styles.masteryRow,
                      i < data.progress.subjectMastery.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.masteryTop}>
                      <Text style={[styles.masterySubject, { color: colors.text }]}>{s.subject}</Text>
                      <Text style={[styles.masteryPct, { color }]}>{s.masteryPercent}%</Text>
                    </View>
                    <ProgressBar value={s.masteryPercent} color={color} height={6} />
                  </View>
                );
              })}
            </GlassCard>
          </Reveal>

          <Reveal delay={140}>
            <SectionHeader title={t('weeklyActivity')} />
            <GlassCard padding={16}>
              <View style={styles.chart}>
                {data.progress.reviewHistory.map((day, dayIndex) => {
                  const max = Math.max(...data.progress.reviewHistory.map((d) => d.reviewedCount), 1);
                  const height = Math.max(6, (day.reviewedCount / max) * 96);
                  return (
                    <View key={`${day.date}-${dayIndex}`} style={styles.chartCol}>
                      <Text style={[styles.chartValue, { color: colors.textMuted }]}>{day.accuracy}%</Text>
                      <View style={[styles.bar, { height, backgroundColor: colors.primary }]} />
                      <Text style={[styles.chartLabel, { color: colors.textSubtle }]} numberOfLines={1}>
                        {day.date}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </GlassCard>
          </Reveal>
        </>
      ) : (
        <>
          <Reveal>
            <GlassCard variant="accent" padding={22} style={styles.examCard}>
              <Text style={[styles.examLabel, { color: colors.primary }]}>
                {t('overallExamReadiness').toUpperCase()}
              </Text>
              <Text style={[styles.examScore, { color: colors.text }]}>{overall}%</Text>
              <Text style={[styles.examReady, { color: colors.textMuted }]}>{t('ready')}</Text>
              <Text style={[styles.examDesc, { color: colors.textMuted }]}>
                {overall >= 80 ? t('readinessHigh') : overall >= 65 ? t('readinessMid') : t('readinessLow')}
              </Text>
            </GlassCard>
          </Reveal>

          {examMetrics.map((m, index) => {
            const color = m.score >= 80 ? colors.success : m.score >= 65 ? colors.warning : colors.danger;
            return (
              <Reveal key={m.key} delay={60 + Math.min(index, 5) * 50}>
                <GlassCard variant="flat" padding={14} style={styles.metricCard}>
                  <View style={styles.metricTop}>
                    <Text style={[styles.metricLabel, { color: colors.text }]}>{t(m.key)}</Text>
                    <Text style={[styles.metricScore, { color }]}>{m.score}%</Text>
                  </View>
                  <ProgressBar value={m.score} color={color} height={6} />
                </GlassCard>
              </Reveal>
            );
          })}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { marginBottom: spacing.lg },
  loading: { gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  sectionCard: { marginBottom: spacing.xl },
  masteryRow: { paddingVertical: 11 },
  masteryTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  masterySubject: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  masteryPct: { fontSize: fontSize.md, fontWeight: fontWeight.bold, fontVariant: ['tabular-nums'] },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 140, paddingTop: 16 },
  chartCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  chartValue: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginBottom: 4, fontVariant: ['tabular-nums'] },
  bar: { width: '70%', borderRadius: 4 },
  chartLabel: { fontSize: fontSize.xs, marginTop: 6 },
  examCard: { marginBottom: spacing.lg, alignItems: 'center' },
  examLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: letterSpacing.micro },
  examScore: { fontSize: 54, fontWeight: fontWeight.heavy, letterSpacing: letterSpacing.display, marginTop: 8, fontVariant: ['tabular-nums'] },
  examReady: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginTop: -4 },
  examDesc: { fontSize: fontSize.md, textAlign: 'center', lineHeight: 20, marginTop: 14, maxWidth: 280 },
  metricCard: { marginBottom: spacing.md },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metricLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  metricScore: { fontSize: fontSize.md, fontWeight: fontWeight.bold, fontVariant: ['tabular-nums'] },
});
