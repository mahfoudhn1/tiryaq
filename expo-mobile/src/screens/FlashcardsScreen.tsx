import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getDashboardSummary, getDecks } from '@/api/study';
import type { DeckSummary } from '@/types/medical';
import { Screen } from '@/components/layout/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme, spacing, fontSize, fontWeight, letterSpacing, statusTints, type TintName } from '@/theme';
import { useTranslation } from '@/i18n';
import type { RootStackParamList, StudentTabParamList } from '@/navigation/AppNavigator';

type FlashcardsNav = CompositeNavigationProp<
  BottomTabNavigationProp<StudentTabParamList, 'FlashcardsTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function FlashcardsScreen() {
  const navigation = useNavigation<FlashcardsNav>();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const { data: decks = [], isLoading } = useQuery({ queryKey: ['decks'], queryFn: getDecks });
  const { data: summary } = useQuery({ queryKey: ['dashboard-summary'], queryFn: getDashboardSummary });

  const totalDue = decks.reduce((a, d) => a + d.dueCount, 0);
  const totalNew = decks.reduce((a, d) => a + d.newCount, 0);
  const totalMastered = decks.reduce((a, d) => a + d.masteredCount, 0);
  const scheme = isDark ? 'dark' : 'light';

  return (
    <Screen title={t('flashcardsTitle')} subtitle={t('flashcardsSubtitle')}>
      <Reveal>
        <View style={styles.grid}>
          <StatCard label={t('dueToday')} value={totalDue} detail={t('cards')} icon="Clock" tint="teal" />
          <StatCard label={t('newCards')} value={totalNew} detail={t('learning')} icon="Plus" tint="blue" />
          <StatCard label={t('mastered')} value={totalMastered} detail={t('cards')} icon="CircleCheck" tint="green" />
          <StatCard label={t('streak')} value={summary?.streakDays ?? 0} detail={t('consecutiveDays')} icon="Flame" tint="amber" />
        </View>

        <Button
          title={`${t('startReview')} (${totalDue} ${t('dueToday').toLowerCase()})`}
          icon="Play"
          size="lg"
          fullWidth
          onPress={() => navigation.navigate('FlashcardReview')}
        />
        <Text style={[styles.progressText, { color: colors.textMuted }]}>
          {summary
            ? `${summary.dailyCompleted}/${summary.dailyGoal} ${t('cardsReviewedToday')}`
            : t('loading')}
        </Text>
      </Reveal>

      <Reveal delay={60}>
        <SectionHeader title={t('yourDecks')} />

        {isLoading ? (
          <View style={styles.list}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} style={{ height: 132 }} />
            ))}
          </View>
        ) : decks.length === 0 ? (
          <EmptyState icon="Brain" title={t('yourDecks')} description={t('noDecks')} />
        ) : (
          <View style={styles.list}>
            {decks.map((deck: DeckSummary) => {
              const mastery = deck.cardCount ? Math.round((deck.masteredCount / deck.cardCount) * 100) : 0;
              return (
                <GlassCard key={deck.id} variant="flat" padding={16}>
                  <View style={styles.deckTop}>
                    <View style={styles.deckTitleRow}>
                      <Text style={[styles.deckSubject, { color: colors.text }]} numberOfLines={1}>
                        {deck.subject}
                      </Text>
                      {deck.dueCount > 0 ? (
                        <Badge variant="teal">{`${deck.dueCount} ${t('dueToday').toLowerCase()}`}</Badge>
                      ) : null}
                    </View>
                    <Badge variant="slate">{`${mastery}% ${t('percentMastered')}`}</Badge>
                  </View>

                  <View style={styles.countRow}>
                    <CountPill label={t('dueToday')} value={deck.dueCount} tint="teal" scheme={scheme} />
                    <CountPill label={t('newCards')} value={deck.newCount} tint="blue" scheme={scheme} />
                    <CountPill label={t('learning')} value={deck.learningCount} tint="amber" scheme={scheme} />
                    <CountPill label={t('mastered')} value={deck.masteredCount} tint="green" scheme={scheme} />
                  </View>

                  <ProgressBar value={mastery} color={colors.success} style={styles.deckProgress} />

                  <View style={styles.deckFooter}>
                    <Text style={[styles.deckCount, { color: colors.textMuted }]}>
                      {deck.cardCount} {t('cards')}
                    </Text>
                    <Button
                      title={t('review')}
                      size="sm"
                      icon="Play"
                      onPress={() => navigation.navigate('FlashcardReview', { deckId: deck.id })}
                    />
                  </View>
                </GlassCard>
              );
            })}
          </View>
        )}
      </Reveal>
    </Screen>
  );
}

function CountPill({
  label,
  value,
  tint,
  scheme,
}: {
  label: string;
  value: number;
  tint: TintName;
  scheme: 'light' | 'dark';
}) {
  const { colors } = useTheme();
  const color = statusTints[tint][scheme];
  return (
    <View style={styles.pill}>
      <View style={[styles.pillDot, { backgroundColor: color }]} />
      <View>
        <Text style={[styles.pillValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.pillLabel, { color: colors.textSubtle }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  progressText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  list: { gap: spacing.md },
  deckTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  deckTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  deckSubject: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, letterSpacing: letterSpacing.tight, flexShrink: 1 },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  pillValue: { fontSize: fontSize.md, fontWeight: fontWeight.bold, fontVariant: ['tabular-nums'] },
  pillLabel: { fontSize: fontSize.xs, marginTop: 1 },
  deckProgress: { marginTop: 12 },
  deckFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  deckCount: { fontSize: fontSize.sm, fontVariant: ['tabular-nums'] },
});
