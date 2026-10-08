import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getQuizDeck } from '@/api/study';
import type { QuizQuestion } from '@/types/medical';
import { Screen } from '@/components/layout/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Reveal } from '@/components/ui/Reveal';
import { PressableScale } from '@/components/ui/PressableScale';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { useTheme, spacing, radius, fontSize, fontWeight, letterSpacing, statusSoftTints } from '@/theme';
import { useTranslation } from '@/i18n';
import type { RootStackParamList } from '@/navigation/AppNavigator';

export default function QuizScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const scheme = isDark ? 'dark' : 'light';

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getQuizDeck();
        if (mounted) setQuestions(data);
      } catch (error) {
        console.error('Failed to load quiz:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
  };

  if (loading) {
    return (
      <Screen>
        <Skeleton style={{ height: 54, marginBottom: spacing.lg }} />
        <Skeleton style={{ height: 160, marginBottom: spacing.lg }} />
        <Skeleton style={{ height: 260 }} />
      </Screen>
    );
  }

  if (questions.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="ClipboardCheck"
          title={t('noQuestions')}
          description={t('noData')}
          actionLabel={t('goBack')}
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  if (index >= questions.length) {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <Screen>
        <Reveal>
          <GlassCard padding={24}>
            <View style={[styles.doneIcon, { backgroundColor: colors.primarySoft }]}>
              <Icon name="Trophy" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.doneTitle, { color: colors.text }]}>{t('sessionComplete')}</Text>
            <Text style={[styles.doneScore, { color: colors.primary }]}>{percent}%</Text>
            <Text style={[styles.doneText, { color: colors.textMuted }]}>
              {t('youAnswered')} {score}/{questions.length} {t('correctly')}
            </Text>
            <Button title={t('tryAgain')} icon="RotateCcw" fullWidth onPress={restart} />
            <Button
              title={t('done')}
              variant="ghost"
              fullWidth
              style={styles.doneSecondary}
              onPress={() => navigation.goBack()}
            />
          </GlassCard>
        </Reveal>
      </Screen>
    );
  }

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const progress = Math.round(((index + 1) / questions.length) * 100);

  const submit = () => {
    if (selected === null || answered) return;
    setAnswered(true);
    if (selected === question.correctAnswer) setScore((s) => s + 1);
  };

  const next = () => {
    setIndex((i) => i + 1);
    setSelected(null);
    setAnswered(false);
  };

  return (
    <Screen>
      <Reveal>
        <GlassCard padding={14} style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={[styles.progressText, { color: colors.text }]}>
              {t('questionOf')} {index + 1} {t('of')} {questions.length}
            </Text>
            <Badge variant={question.yieldRating === 'High' ? 'teal' : 'slate'}>
              {question.yieldRating} {t('highYield').toLowerCase()}
            </Badge>
          </View>
          <ProgressBar value={progress} style={styles.progressBar} />
        </GlassCard>
      </Reveal>

      <Reveal delay={60}>
        <GlassCard padding={20} style={styles.vignetteCard}>
          <Text style={[styles.subject, { color: colors.primary }]}>
            {question.subject.toUpperCase()}
          </Text>
          <Text style={[styles.vignette, { color: colors.text }]}>{question.vignette}</Text>
        </GlassCard>
      </Reveal>

      <View style={styles.options}>
        {question.options.map((option, i) => {
          const isSelected = selected === i;
          const isCorrect = i === question.correctAnswer;
          const showCorrect = answered && isCorrect;
          const showWrong = answered && isSelected && !isCorrect;
          const borderColor = showCorrect
            ? colors.success
            : showWrong
              ? colors.danger
              : isSelected
                ? colors.primary
                : colors.border;
          const softBg = showCorrect
            ? statusSoftTints.green[scheme]
            : showWrong
              ? statusSoftTints.red[scheme]
              : isSelected
                ? colors.primarySoft
                : 'transparent';
          return (
            <PressableScale
              key={`${question.id}-${i}`}
              onPress={() => setSelected(i)}
              disabled={answered}
              scaleTo={0.98}
              style={styles.optionWrap}
              accessibilityLabel={option}
            >
              <View style={[styles.option, { borderColor, backgroundColor: softBg }]}>
                <View
                  style={[
                    styles.optionLetter,
                    { backgroundColor: softBg, borderColor },
                  ]}
                >
                  <Text style={[styles.optionLetterText, { color: borderColor }]}>
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
                <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
                {showCorrect ? <Icon name="CircleCheck" size={18} color={colors.success} /> : null}
                {showWrong ? <Icon name="X" size={18} color={colors.danger} /> : null}
              </View>
            </PressableScale>
          );
        })}
      </View>

      {answered ? (
        <Reveal>
          <GlassCard padding={16} style={styles.explanationCard}>
            <View style={styles.explanationHead}>
              <Icon
                name={selected === question.correctAnswer ? 'CircleCheck' : 'CircleAlert'}
                size={17}
                color={selected === question.correctAnswer ? colors.success : colors.danger}
              />
              <Text
                style={[
                  styles.explanationTitle,
                  {
                    color: selected === question.correctAnswer ? colors.success : colors.danger,
                  },
                ]}
              >
                {selected === question.correctAnswer ? t('correct') : t('submitAnswer')}
              </Text>
            </View>
            <Text style={[styles.explanationText, { color: colors.textMuted }]}>
              {question.explanation}
            </Text>
          </GlassCard>
        </Reveal>
      ) : null}

      <Button
        title={answered ? (isLast ? t('seeResults') : t('nextQuestion')) : t('submitAnswer')}
        size="lg"
        fullWidth
        disabled={!answered && selected === null}
        iconRight={answered ? 'ArrowRight' : undefined}
        style={styles.submit}
        onPress={answered ? next : submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressCard: { marginBottom: spacing.lg },
  progressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, fontVariant: ['tabular-nums'] },
  progressBar: { marginTop: 10 },
  vignetteCard: { marginBottom: spacing.lg },
  subject: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: letterSpacing.micro, marginBottom: 10 },
  vignette: { fontSize: fontSize.lg, lineHeight: 25, fontWeight: fontWeight.medium },
  options: { gap: 10 },
  optionWrap: { width: '100%' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderRadius: radius.lg,
    minHeight: 60,
    padding: 14,
  },
  optionLetter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  optionText: { flex: 1, fontSize: fontSize.md, lineHeight: 20 },
  explanationCard: { marginTop: spacing.lg },
  explanationHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  explanationTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: letterSpacing.tight },
  explanationText: { fontSize: fontSize.md, lineHeight: 21 },
  doneIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  doneTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, textAlign: 'center', marginTop: 16 },
  doneScore: { fontSize: 48, fontWeight: fontWeight.heavy, textAlign: 'center', marginTop: 8, fontVariant: ['tabular-nums'] },
  doneText: { fontSize: fontSize.md, textAlign: 'center', marginBottom: 20 },
  doneSecondary: { marginTop: spacing.sm },
  submit: { marginTop: spacing.lg },
});
