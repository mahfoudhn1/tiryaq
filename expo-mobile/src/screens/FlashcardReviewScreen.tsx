import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { getFlashcards, submitFlashcardRating } from '@/api/study';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { FlashcardDifficulty } from '@/types/medical';
import { Screen } from '@/components/layout/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Reveal } from '@/components/ui/Reveal';
import { PressableScale } from '@/components/ui/PressableScale';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useTheme, spacing, radius, fontSize, fontWeight, letterSpacing, statusTints, statusSoftTints, type TintName } from '@/theme';
import { useTranslation } from '@/i18n';
import { useReduceMotion } from '@/hooks/useA11y';

const RATINGS: {
  key: FlashcardDifficulty;
  labelKey: 'again' | 'hard' | 'good' | 'easy';
  interval: string;
  tint: TintName;
}[] = [
  { key: 'Again', labelKey: 'again', interval: '<1d', tint: 'red' },
  { key: 'Hard', labelKey: 'hard', interval: '2-3d', tint: 'amber' },
  { key: 'Good', labelKey: 'good', interval: '4-5d', tint: 'teal' },
  { key: 'Easy', labelKey: 'easy', interval: '10d+', tint: 'green' },
];

export default function FlashcardReviewScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const reduceMotion = useReduceMotion();
  const route = useRoute<RouteProp<RootStackParamList, 'FlashcardReview'>>();
  const deckId = route.params?.deckId;
  const scheme = isDark ? 'dark' : 'light';

  const { data: cards = [], isFetching, isError, refetch } = useQuery({
    queryKey: ['review-flashcards', deckId],
    queryFn: () => getFlashcards({ deckId }),
  });

  const [index, setIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<FlashcardDifficulty[]>([]);
  const [fade] = useState(() => new Animated.Value(1));

  const loading = isFetching && cards.length === 0;

  const reload = async () => {
    setIndex(0);
    setResults([]);
    setRevealed(false);
    fade.setValue(1);
    await refetch();
  };

  const reveal = () => {
    if (!reduceMotion) {
      Animated.sequence([
        Animated.timing(fade, { toValue: 0.2, duration: 110, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    }
    setRevealed(true);
  };

  const rate = async (rating: FlashcardDifficulty) => {
    if (submitting || index >= cards.length) return;
    setSubmitting(true);
    try {
      await submitFlashcardRating(cards[index].id, rating);
      setResults((prev) => [...prev, rating]);
      setIndex((prev) => prev + 1);
      setRevealed(false);
      fade.setValue(1);
    } catch (error) {
      console.error('Failed to rate card:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Screen title={t('flashcardsTitle')}>
        <Skeleton style={{ height: 54, marginBottom: spacing.lg }} />
        <Skeleton style={{ height: 340, marginBottom: spacing.lg }} />
        <Skeleton style={{ height: 120 }} />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen title={t('flashcardsTitle')}>
        <EmptyState
          icon="RefreshCw"
          title={t('error')}
          description={t('noData')}
          actionLabel={t('retry')}
          onAction={reload}
        />
      </Screen>
    );
  }

  if (cards.length === 0) {
    return (
      <Screen title={t('flashcardsTitle')}>
        <EmptyState
          icon="CircleCheck"
          title={t('mastered')}
          description={t('noDecks')}
          actionLabel={t('reviewSameAgain')}
          onAction={reload}
        />
      </Screen>
    );
  }

  if (index >= cards.length) {
    const counts: Record<FlashcardDifficulty, number> = {
      Again: results.filter((r) => r === 'Again').length,
      Hard: results.filter((r) => r === 'Hard').length,
      Good: results.filter((r) => r === 'Good').length,
      Easy: results.filter((r) => r === 'Easy').length,
    };

    return (
      <Screen title={t('flashcardsTitle')}>
        <Reveal>
          <GlassCard padding={22}>
            <View style={[styles.doneIcon, { backgroundColor: colors.primarySoft }]}>
              <Icon name="Trophy" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.doneTitle, { color: colors.text }]}>{t('reviewComplete')}</Text>
            <Text style={[styles.doneText, { color: colors.textMuted }]}>{t('reviewCompleteDesc')}</Text>

            <View style={styles.metricsRow}>
              {RATINGS.map((r) => (
                <View
                  key={r.key}
                  style={[
                    styles.metric,
                    { borderColor: colors.border, backgroundColor: statusSoftTints[r.tint][scheme] },
                  ]}
                >
                  <Text style={[styles.metricValue, { color: colors.text }]}>{counts[r.key]}</Text>
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{t(r.labelKey)}</Text>
                </View>
              ))}
            </View>

            <Button title={t('reviewSameAgain')} icon="RotateCcw" fullWidth onPress={reload} />
          </GlassCard>
        </Reveal>
      </Screen>
    );
  }

  const card = cards[index];
  const progress = Math.round(((index + 1) / cards.length) * 100);

  return (
    <Screen title={t('flashcardsTitle')}>
      <Reveal>
        <GlassCard padding={14} style={styles.sessionCard}>
          <View style={styles.sessionRow}>
            <View style={[styles.sessionDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.sessionLabel, { color: colors.text }]}>
              {t('activeReviewSession').toUpperCase()}
            </Text>
            <Text style={[styles.sessionCount, { color: colors.textMuted }]}>
              {t('card')} {index + 1} {t('of')} {cards.length}
            </Text>
          </View>
          <ProgressBar value={progress} style={styles.sessionProgress} />
        </GlassCard>
      </Reveal>

      <Animated.View style={{ opacity: fade }}>
        <GlassCard padding={22} style={styles.card}>
          {!revealed ? (
            <View>
              <MetaTag
                icon="Brain"
                label={`${t('clinicalVignette').toUpperCase()} · ${card.subject}`}
                scheme={scheme}
              />
              <Text style={[styles.cardMeta, { color: colors.textSubtle }]}>{t('frontOfCard')}</Text>
              <Text style={[styles.cardQuestion, { color: colors.text }]}>{card.vignette}</Text>
              <View style={styles.tapHint}>
                <Icon name="RotateCcw" size={14} color={colors.textMuted} />
                <Text style={[styles.tapHintText, { color: colors.textMuted }]}>{t('tapToReveal')}</Text>
              </View>
            </View>
          ) : (
            <View>
              <MetaTag
                icon="CircleCheck"
                label={t('diagnosisRationale').toUpperCase()}
                tint="green"
                scheme={scheme}
              />
              <Text style={[styles.cardMeta, { color: colors.textSubtle }]}>{t('backOfCard')}</Text>

              <View style={[styles.diagnosisBox, { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.diagnosisLabel, { color: colors.primary }]}>
                  {t('coreDiagnosis').toUpperCase()}
                </Text>
                <Text style={[styles.diagnosisText, { color: colors.text }]}>{card.diagnosis}</Text>
              </View>

              <Text style={[styles.rationaleLabel, { color: colors.textMuted }]}>
                {t('highYieldRationale').toUpperCase()}
              </Text>
              <Text style={[styles.rationaleText, { color: colors.text }]}>{card.rationale}</Text>
            </View>
          )}
        </GlassCard>
      </Animated.View>

      <Reveal delay={120}>
        <GlassCard padding={16} style={styles.gradeCard}>
          {!revealed ? (
            <Button title={t('revealDiagnosis')} icon="Eye" size="lg" fullWidth onPress={reveal} />
          ) : (
            <View>
              <Text style={[styles.gradePrompt, { color: colors.textMuted }]}>{t('gradePrompt')}</Text>
              <View style={styles.ratingRow}>
                {RATINGS.map((r) => (
                  <RatingButton
                    key={r.key}
                    label={t(r.labelKey)}
                    interval={r.interval}
                    tint={r.tint}
                    scheme={scheme}
                    disabled={submitting}
                    onPress={() => rate(r.key)}
                  />
                ))}
              </View>
            </View>
          )}
        </GlassCard>
      </Reveal>
    </Screen>
  );
}

function MetaTag({
  icon,
  label,
  tint = 'teal',
  scheme,
}: {
  icon: IconName;
  label: string;
  tint?: TintName;
  scheme: 'light' | 'dark';
}) {
  const color = statusTints[tint][scheme];
  return (
    <View style={[styles.metaTag, { backgroundColor: statusSoftTints[tint][scheme] }]}>
      <Icon name={icon} size={13} color={color} />
      <Text style={[styles.metaTagText, { color }]}>{label}</Text>
    </View>
  );
}

function RatingButton({
  label,
  interval,
  tint,
  scheme,
  disabled,
  onPress,
}: {
  label: string;
  interval: string;
  tint: TintName;
  scheme: 'light' | 'dark';
  disabled: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const accent = statusTints[tint][scheme];
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      style={styles.ratingWrap}
      accessibilityLabel={`${label} ${interval}`}
    >
      <View
        style={[
          styles.ratingButton,
          { borderColor: `${accent}55`, backgroundColor: statusSoftTints[tint][scheme] },
          disabled && styles.disabled,
        ]}
      >
        <Text style={[styles.ratingLabel, { color: accent }]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.ratingInterval, { color: colors.textSubtle }]}>{interval}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  sessionCard: { marginBottom: spacing.lg },
  sessionProgress: { marginTop: 10 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessionDot: { width: 8, height: 8, borderRadius: 4 },
  sessionLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: letterSpacing.micro, flex: 1 },
  sessionCount: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, fontVariant: ['tabular-nums'] },
  card: { minHeight: 300, justifyContent: 'center' },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 14,
  },
  metaTagText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: letterSpacing.tight },
  cardMeta: { fontSize: fontSize.sm, marginBottom: 10 },
  cardQuestion: { fontSize: fontSize.lg, fontWeight: fontWeight.medium, lineHeight: 25 },
  tapHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 26, justifyContent: 'center' },
  tapHintText: { fontSize: fontSize.sm },
  diagnosisBox: { borderRadius: radius.lg, padding: 18, marginBottom: 16 },
  diagnosisLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: letterSpacing.micro, marginBottom: 6 },
  diagnosisText: { fontSize: 22, fontWeight: fontWeight.bold, letterSpacing: letterSpacing.tight },
  rationaleLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: letterSpacing.micro, marginBottom: 6 },
  rationaleText: { fontSize: fontSize.md, lineHeight: 21 },
  gradeCard: { marginTop: spacing.lg },
  gradePrompt: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, textAlign: 'center', marginBottom: 12 },
  ratingRow: { flexDirection: 'row', gap: 8 },
  ratingWrap: { flex: 1 },
  ratingButton: {
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    minHeight: 60,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  ratingLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  ratingInterval: { fontSize: fontSize.xs, marginTop: 3 },
  disabled: { opacity: 0.6 },
  doneIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  doneTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, textAlign: 'center', marginTop: 16 },
  doneText: { fontSize: fontSize.md, textAlign: 'center', lineHeight: 20, marginTop: 8 },
  metricsRow: { flexDirection: 'row', gap: 8, marginVertical: 20 },
  metric: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
  },
  metricValue: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, fontVariant: ['tabular-nums'] },
  metricLabel: { fontSize: fontSize.xs, marginTop: 2 },
});
