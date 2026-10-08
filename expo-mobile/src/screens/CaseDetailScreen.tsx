import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getClinicalCase, updateCaseProgress } from '@/api/study';
import type { ClinicalCase } from '@/types/medical';
import { Screen } from '@/components/layout/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { PressableScale } from '@/components/ui/PressableScale';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { useTheme, spacing, radius, fontSize, fontWeight, letterSpacing, statusSoftTints } from '@/theme';
import { useTranslation } from '@/i18n';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type CaseRoute = RouteProp<RootStackParamList, 'CaseDetail'>;
type Tab = 'physical' | 'labs' | 'diagnosis';

export default function CaseDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<CaseRoute>();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const scheme = isDark ? 'dark' : 'light';

  const [data, setData] = useState<ClinicalCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('physical');
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await getClinicalCase(route.params.id);
        if (!mounted) return;
        setData(result);
        setSelected(result?.differentialDiagnosis?.[0]?.id ?? null);
      } catch (error) {
        console.error('Failed to load case:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [route.params.id]);

  const markCompleted = async () => {
    if (!data) return;
    try {
      await updateCaseProgress(data.id, { status: 'completed' });
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  if (loading) {
    return (
      <Screen>
        <Skeleton style={{ height: 80, marginBottom: spacing.lg }} />
        <Skeleton style={{ height: 48, marginBottom: spacing.lg }} />
        <Skeleton style={{ height: 320 }} />
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen>
        <EmptyState
          icon="CircleAlert"
          title={t('caseNotFound')}
          description={t('noData')}
          actionLabel={t('goBack')}
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  return (
    <Screen title={data.title} subtitle={t('clinicalCasesTitle')}>
      <SegmentedControl<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'physical', label: t('physicalExam') },
          { value: 'labs', label: t('labResults') },
          { value: 'diagnosis', label: t('diagnosis') },
        ]}
        style={styles.tabs}
      />

      <Reveal key={tab}>
        {tab === 'physical' ? (
          <GlassCard padding={20}>
            <Block title={t('presentingComplaint')} body={data.presentingComplaint} />
            <Block title={t('historyPresentIllness')} body={data.historyOfPresentIllness} />
            <Block title={t('pastMedicalHistory')} body={data.pastMedicalHistory} />
            <Text style={[styles.subTitle, { color: colors.textSubtle }]}>
              {t('physicalExamination').toUpperCase()}
            </Text>
            <ExamRow label={t('general')} value={data.physicalExam.general} />
            <ExamRow label={t('vitals')} value={data.physicalExam.vitals} />
            <ExamRow label={t('abdomen')} value={data.physicalExam.abdomen} />
            <ExamRow label={t('neurological')} value={data.physicalExam.neurological} />
          </GlassCard>
        ) : null}

        {tab === 'labs' ? (
          <GlassCard padding={20}>
            <Text style={[styles.blockTitle, { color: colors.text }]}>{t('labInvestigations')}</Text>
            <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.th, styles.colName, { color: colors.textSubtle }]}>{t('referenceRange')}</Text>
              <Text style={[styles.th, { color: colors.textSubtle }]}> </Text>
            </View>
            {data.labs.map((lab, i) => (
              <View
                key={`${lab.name}-${i}`}
                style={[styles.labRow, { borderBottomColor: colors.border }]}
              >
                <View style={styles.labInfo}>
                  <Text style={[styles.labName, { color: colors.text }]}>{lab.name}</Text>
                  <Text style={[styles.labRange, { color: colors.textSubtle }]}>{lab.referenceRange}</Text>
                </View>
                <Text style={[styles.labValue, { color: colors.text }]}>{lab.value}</Text>
                <View
                  style={[
                    styles.labStatus,
                    {
                      backgroundColor:
                        statusSoftTints[lab.status === 'Normal' ? 'green' : 'red'][scheme],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.labStatusText,
                      { color: lab.status === 'Normal' ? colors.success : colors.danger },
                    ]}
                  >
                    {lab.status}
                  </Text>
                </View>
              </View>
            ))}
          </GlassCard>
        ) : null}

        {tab === 'diagnosis' ? (
          <GlassCard padding={20}>
            <Text style={[styles.blockTitle, { color: colors.text }]}>{t('differentialDiagnosis')}</Text>
            <Text style={[styles.blockBody, { color: colors.textMuted }]}>{t('selectDiagnosis')}</Text>

            {data.differentialDiagnosis.map((d) => {
              const isSelected = selected === d.id;
              const borderColor = isSelected
                ? d.correct
                  ? colors.success
                  : colors.danger
                : colors.border;
              return (
                <PressableScale
                  key={d.id}
                  onPress={() => setSelected(d.id)}
                  style={styles.diagnosisWrap}
                  scaleTo={0.98}
                  accessibilityLabel={d.diagnosis}
                >
                  <View style={[styles.diagnosis, { borderColor }]}>
                    <View style={styles.diagnosisHead}>
                      <Text style={[styles.diagnosisName, { color: colors.text }]}>{d.diagnosis}</Text>
                      {d.correct ? (
                        <View style={[styles.correctTag, { backgroundColor: statusSoftTints.green[scheme] }]}>
                          <Icon name="CircleCheck" size={12} color={colors.success} />
                          <Text style={[styles.correctText, { color: colors.success }]}>{t('correct')}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.diagnosisFeedback, { color: colors.textMuted }]}>{d.feedback}</Text>
                  </View>
                </PressableScale>
              );
            })}

            <View style={[styles.discussion, { backgroundColor: colors.primarySoft }]}>
              <Text style={[styles.blockTitle, { color: colors.text }]}>{t('caseDiscussion')}</Text>
              <Text style={[styles.blockBody, { color: colors.text }]}>{data.discussion}</Text>
              <Text style={[styles.subTitle, { color: colors.primary }]}>
                {t('finalDiagnosis').toUpperCase()}
              </Text>
              <Text style={[styles.finalText, { color: colors.primary }]}>{data.finalDiagnosis}</Text>
            </View>
          </GlassCard>
        ) : null}
      </Reveal>

      <Button
        title={t('markCompleted')}
        icon="CircleCheck"
        size="lg"
        fullWidth
        style={styles.complete}
        onPress={markCompleted}
      />
    </Screen>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.block}>
      <Text style={[styles.subTitle, { color: colors.textSubtle }]}>{title.toUpperCase()}</Text>
      <Text style={[styles.blockBody, { color: colors.text }]}>{body}</Text>
    </View>
  );
}

function ExamRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.examRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.examLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.examValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { marginBottom: spacing.lg },
  block: { marginBottom: 16 },
  blockTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: 6 },
  blockBody: { fontSize: fontSize.md, lineHeight: 21 },
  subTitle: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: letterSpacing.micro, marginBottom: 6 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 8, marginBottom: 4 },
  th: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: letterSpacing.tight, textTransform: 'uppercase' },
  colName: { flex: 1 },
  examRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 40,
    paddingVertical: 9,
    borderBottomWidth: 1,
    gap: 12,
  },
  examLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  examValue: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, flex: 1, textAlign: 'right' },
  labRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: 11,
    borderBottomWidth: 1,
    gap: 10,
  },
  labInfo: { flex: 1 },
  labName: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  labRange: { fontSize: fontSize.xs, marginTop: 1 },
  labValue: { fontSize: fontSize.md, fontWeight: fontWeight.bold, fontVariant: ['tabular-nums'] },
  labStatus: { borderRadius: radius.sm, paddingHorizontal: 7, paddingVertical: 3 },
  labStatusText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase' },
  diagnosisWrap: { marginBottom: 10 },
  diagnosis: {
    borderWidth: 2,
    borderRadius: radius.lg,
    padding: 14,
  },
  diagnosisHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  diagnosisName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, flex: 1 },
  correctTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  correctText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase' },
  diagnosisFeedback: { fontSize: fontSize.sm, lineHeight: 19 },
  discussion: { borderRadius: radius.lg, padding: 16, marginTop: 14 },
  finalText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  complete: { marginTop: spacing.lg },
});
