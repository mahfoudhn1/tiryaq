import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '@/api/admin';
import { Screen } from '@/components/layout/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useTheme, spacing, radius, fontSize } from '@/theme';
import { useTranslation } from '@/i18n';
import { formatCurrency, formatNumber } from '@/lib/format';

export default function AdminDashboardScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const { data: stats, isLoading, isError, refetch } = useQuery({ queryKey: ['admin-stats'], queryFn: getAdminStats });

  const management: { labelKey: 'instructorApprovals' | 'courseModeration' | 'userManagement'; descKey: 'instructorApprovalsDesc' | 'courseModerationDesc' | 'userManagementDesc'; icon: IconName }[] = [
    { labelKey: 'instructorApprovals', descKey: 'instructorApprovalsDesc', icon: 'GraduationCap' },
    { labelKey: 'courseModeration', descKey: 'courseModerationDesc', icon: 'BookOpen' },
    { labelKey: 'userManagement', descKey: 'userManagementDesc', icon: 'Users' },
  ];

  return (
    <Screen title={t('adminConsole')} subtitle={t('adminSubtitle')}>
      {isLoading ? (
        <View style={styles.grid}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} style={{ height: 108, flex: 1 }} />
          ))}
        </View>
      ) : isError || !stats ? (
        <GlassCard padding={8}>
          <EmptyState
            icon="CircleAlert"
            title={t('error')}
            description={t('noData')}
            actionLabel={t('retry')}
            onAction={() => refetch()}
          />
        </GlassCard>
      ) : (
        <>
          {stats.pendingApprovals > 0 ? (
            <GlassCard accent padding={16} style={{ marginBottom: spacing.lg }}>
              <View style={styles.alertRow}>
                <View style={[styles.alertIcon, { backgroundColor: colors.primarySoft }]}>
                  <Icon name="CircleAlert" size={19} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.alertTitle, { color: colors.text }]}>
                    {stats.pendingApprovals} {t('itemsAwaiting')}
                  </Text>
                  <Text style={[styles.alertDesc, { color: colors.textMuted }]}>{t('awaitingDesc')}</Text>
                </View>
                <Icon name="ChevronRight" size={18} color={colors.primary} />
              </View>
            </GlassCard>
          ) : null}

          <View style={styles.grid}>
            <StatCard label={t('totalUsers')} value={formatNumber(stats.totalUsers)} icon="Users" tint="blue" trend="8%" trendUp />
            <StatCard label={t('activeStudents')} value={formatNumber(stats.activeStudents)} icon="UserCheck" tint="teal" />
            <StatCard label={t('instructorsLabel')} value={stats.totalInstructors} icon="GraduationCap" tint="green" />
            <StatCard label={t('coursesStat')} value={stats.totalCourses} icon="BookOpen" tint="amber" />
            <StatCard label={t('platformRevenue')} value={formatCurrency(stats.totalRevenue)} icon="DollarSign" tint="green" />
            <StatCard label={t('pendingApprovals')} value={stats.pendingApprovals} icon="CircleAlert" tint="red" />
          </View>
        </>
      )}

      <SectionHeader title={t('management')} />
      <View style={styles.manageGrid}>
        {management.map((item) => (
          <Pressable key={item.labelKey} style={styles.manageItem}>
            <GlassCard padding={16} style={styles.manageCard}>
              <View style={styles.manageTop}>
                <View style={[styles.manageIcon, { backgroundColor: colors.primarySoft }]}>
                  <Icon name={item.icon} size={20} color={colors.primary} />
                </View>
                {item.labelKey === 'instructorApprovals' && stats?.pendingApprovals ? (
                  <Badge variant="amber">{stats.pendingApprovals}</Badge>
                ) : null}
              </View>
              <Text style={[styles.manageLabel, { color: colors.text }]}>{t(item.labelKey)}</Text>
              <Text style={[styles.manageDesc, { color: colors.textMuted }]}>{t(item.descKey)}</Text>
            </GlassCard>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  alertIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: { fontSize: fontSize.md, fontWeight: '700' },
  alertDesc: { fontSize: fontSize.sm, marginTop: 2, lineHeight: 17 },
  manageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  manageItem: { flexGrow: 1, flexBasis: 150 },
  manageCard: { minHeight: 132 },
  manageTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  manageIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageLabel: { fontSize: fontSize.md, fontWeight: '700' },
  manageDesc: { fontSize: fontSize.sm, marginTop: 3, lineHeight: 17 },
});
