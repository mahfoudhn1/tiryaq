import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getCases, getStudyAnalytics } from '@/api/study';
import type { ClinicalCaseListItem } from '@/types/medical';
import { Screen } from '@/components/layout/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { useTheme, spacing, radius, fontSize, fontWeight, letterSpacing } from '@/theme';
import { useTranslation } from '@/i18n';
import type { RootStackParamList, StudentTabParamList } from '@/navigation/AppNavigator';

type CasesNav = CompositeNavigationProp<
  BottomTabNavigationProp<StudentTabParamList, 'CasesTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Filter = 'all' | 'available' | 'in-progress' | 'completed';

const DIFFICULTY_TINT: Record<string, 'green' | 'amber' | 'red'> = {
  Beginner: 'green',
  Intermediate: 'amber',
  Advanced: 'red',
};

export default function CasesScreen() {
  const navigation = useNavigation<CasesNav>();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>('all');

  const { data: cases = [], isLoading } = useQuery({ queryKey: ['cases'], queryFn: () => getCases() });
  const { data: analytics } = useQuery({ queryKey: ['analytics'], queryFn: getStudyAnalytics });

  const filtered = filter === 'all' ? cases : cases.filter((c) => c.status === filter);
  const completed = cases.filter((c) => c.status === 'completed').length;
  const inProgress = cases.filter((c) => c.status === 'in-progress').length;
  const successRate = analytics ? Math.round(analytics.clinicalCaseSuccessRate) : 0;

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: `${t('all')} (${cases.length})` },
    { key: 'available', label: t('start') },
    { key: 'in-progress', label: t('inProgress') },
    { key: 'completed', label: t('completed') },
  ];

  return (
    <Screen title={t('clinicalCasesTitle')} subtitle={t('casesSubtitle')}>
      <Reveal>
        <View style={styles.grid}>
          <StatCard
            label={t('completed')}
            value={completed}
            detail={`${t('of')} ${cases.length}`}
            icon="CircleCheck"
            tint="green"
            progress={cases.length ? Math.round((completed / cases.length) * 100) : 0}
          />
          <StatCard label={t('inProgress')} value={inProgress} detail={t('navCases')} icon="RotateCcw" tint="teal" />
          <StatCard label={t('clinicalReasoning')} value={`${successRate}%`} detail={t('accuracy')} icon="Target" tint="blue" />
        </View>

        <ChipRow style={styles.chips}>
          {filters.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              active={filter === f.key}
              onPress={() => setFilter(f.key)}
            />
          ))}
        </ChipRow>
      </Reveal>

      <Reveal delay={80}>
        {isLoading ? (
          <View style={styles.list}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} style={{ height: 150 }} />
            ))}
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState icon="Stethoscope" title={t('clinicalCasesTitle')} description={t('noCases')} />
        ) : (
          filtered.map((item: ClinicalCaseListItem) => {
            const pct = item.totalSteps ? Math.round((item.completedSteps / item.totalSteps) * 100) : 0;
            const actionLabel =
              item.status === 'completed'
                ? t('reviewCase')
                : item.status === 'in-progress'
                  ? t('continueCase')
                  : t('startCase');
            return (
              <GlassCard key={item.id} variant="flat" padding={16} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.badges}>
                    <Badge variant={DIFFICULTY_TINT[item.difficulty] ?? 'slate'}>{item.difficulty}</Badge>
                    {item.status !== 'available' ? (
                      <Badge variant={item.status === 'completed' ? 'green' : 'teal'}>
                        {item.status === 'completed' ? t('completed') : t('inProgress')}
                      </Badge>
                    ) : null}
                  </View>
                  <Text style={[styles.specialty, { color: colors.textSubtle }]}>{item.specialty}</Text>
                </View>

                <Text style={[styles.caseTitle, { color: colors.text }]}>{item.title}</Text>

                {item.tags.length ? (
                  <View style={styles.tags}>
                    {item.tags.slice(0, 4).map((tag, tagIndex) => (
                      <View key={`${tag}-${tagIndex}`} style={[styles.tag, { backgroundColor: colors.primarySoft }]}>
                        <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Icon name="Clock" size={13} color={colors.textSubtle} />
                    <Text style={[styles.metaText, { color: colors.textMuted }]}>{item.estimatedTime}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Icon name="Target" size={13} color={colors.textSubtle} />
                    <Text style={[styles.metaText, { color: colors.textMuted }]}>
                      {item.totalSteps} {t('decisionPoints')}
                    </Text>
                  </View>
                </View>

                {item.status === 'in-progress' ? (
                  <View style={styles.progressBlock}>
                    <ProgressBar value={pct} />
                    <Text style={[styles.progressLabel, { color: colors.textSubtle }]}>
                      {item.completedSteps}/{item.totalSteps} {t('steps')}
                    </Text>
                  </View>
                ) : null}

                <Button
                  title={actionLabel}
                  size="sm"
                  variant={item.status === 'completed' ? 'secondary' : 'primary'}
                  icon="ArrowRight"
                  style={styles.action}
                  onPress={() => navigation.navigate('CaseDetail', { id: item.id })}
                />
              </GlassCard>
            );
          })
        )}
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg },
  chips: { marginBottom: spacing.lg },
  list: { gap: spacing.md },
  card: { marginBottom: spacing.md },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  badges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 },
  specialty: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  caseTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, letterSpacing: letterSpacing.tight },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: { borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: fontSize.sm, fontVariant: ['tabular-nums'] },
  progressBlock: { marginTop: 12 },
  progressLabel: { fontSize: fontSize.xs, marginTop: 5, fontVariant: ['tabular-nums'] },
  action: { marginTop: 14, alignSelf: 'flex-start' },
});
