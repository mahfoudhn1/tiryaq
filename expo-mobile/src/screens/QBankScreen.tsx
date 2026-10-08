import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/layout/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Reveal } from '@/components/ui/Reveal';
import { useTheme, spacing, fontSize, fontWeight, letterSpacing } from '@/theme';
import { useTranslation } from '@/i18n';
import type { RootStackParamList, StudentTabParamList } from '@/navigation/AppNavigator';

type QBankNav = CompositeNavigationProp<
  BottomTabNavigationProp<StudentTabParamList, 'QBankTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const SUBJECTS = ['All', 'Cardiology', 'Pulmonology', 'Neurology', 'Nephrology', 'Pediatrics'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const SUBJECT_STATS = [
  { subject: 'Cardiology', answered: 48, correct: 42, pct: 88 },
  { subject: 'Pulmonology', answered: 35, correct: 26, pct: 74 },
  { subject: 'Nephrology', answered: 22, correct: 14, pct: 64 },
  { subject: 'Pediatrics', answered: 30, correct: 21, pct: 70 },
];

export default function QBankScreen() {
  const navigation = useNavigation<QBankNav>();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [subject, setSubject] = useState('All');
  const [difficulty, setDifficulty] = useState('All');

  return (
    <Screen title={t('qbankTitle')} subtitle={t('qbankSubtitle')}>
      <Reveal>
        <GlassCard padding={18} style={styles.sessionCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('startNewSession')}</Text>

          <Text style={[styles.label, { color: colors.textSubtle }]}>{t('subject').toUpperCase()}</Text>
          <ChipRow style={styles.chipRow}>
            {SUBJECTS.map((option) => (
              <Chip
                key={option}
                label={option}
                active={subject === option}
                onPress={() => setSubject(option)}
              />
            ))}
          </ChipRow>

          <Text style={[styles.label, { color: colors.textSubtle }]}>{t('difficulty').toUpperCase()}</Text>
          <ChipRow style={styles.chipRow}>
            {DIFFICULTIES.map((option) => (
              <Chip
                key={option}
                label={option}
                active={difficulty === option}
                onPress={() => setDifficulty(option)}
              />
            ))}
          </ChipRow>

          <Button
            title={t('startSession')}
            icon="Play"
            size="lg"
            fullWidth
            style={styles.primaryAction}
            onPress={() => navigation.navigate('QuizSession')}
          />
          <Button
            title={t('quickQuiz')}
            variant="secondary"
            icon="Zap"
            fullWidth
            style={styles.secondaryAction}
            onPress={() => navigation.navigate('QuizSession')}
          />
        </GlassCard>
      </Reveal>

      <Reveal delay={80}>
        <SectionHeader title={t('performanceBySubject')} />
        <GlassCard padding={16}>
          {SUBJECT_STATS.map((s, index) => {
            const color = s.pct >= 80 ? colors.success : s.pct >= 65 ? colors.warning : colors.danger;
            return (
              <View
                key={s.subject}
                style={[
                  styles.subjectRow,
                  index < SUBJECT_STATS.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.subjectTop}>
                  <Text style={[styles.subjectName, { color: colors.text }]}>{s.subject}</Text>
                  <Text style={[styles.subjectPct, { color }]}>{s.pct}%</Text>
                </View>
                <ProgressBar value={s.pct} color={color} height={6} />
                <Text style={[styles.subjectMeta, { color: colors.textSubtle }]}>
                  {s.correct}/{s.answered} {t('answered')}
                  {s.pct < 70 ? ` · ${t('belowAverage')}` : ''}
                </Text>
              </View>
            );
          })}
        </GlassCard>
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sessionCard: { marginBottom: spacing.xl },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.md },
  label: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: letterSpacing.micro, marginBottom: 8 },
  chipRow: { marginBottom: spacing.md },
  primaryAction: { marginTop: spacing.md },
  secondaryAction: { marginTop: spacing.sm },
  subjectRow: { paddingVertical: 12 },
  subjectTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  subjectName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  subjectPct: { fontSize: fontSize.md, fontWeight: fontWeight.bold, fontVariant: ['tabular-nums'] },
  subjectMeta: { fontSize: fontSize.xs, marginTop: 6, fontVariant: ['tabular-nums'] },
});
