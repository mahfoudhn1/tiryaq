import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { getLiveSessions, type LiveSessionFilter } from '@/api/live';
import type { LiveSession } from '@/types/medical';
import { Screen } from '@/components/layout/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { useTheme, spacing, radius, fontSize, fontWeight, letterSpacing } from '@/theme';
import { useTranslation } from '@/i18n';
import { formatDateTime } from '@/lib/format';

export default function LiveScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<LiveSessionFilter>('all');

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['live-sessions', filter],
    queryFn: () => getLiveSessions(filter),
  });

  const filters: { key: LiveSessionFilter; label: string }[] = [
    { key: 'all', label: t('all') },
    { key: 'live', label: t('live') },
    { key: 'upcoming', label: t('upcoming') },
    { key: 'ended', label: t('ended') },
  ];

  const statusTint: Record<string, 'red' | 'teal' | 'slate'> = {
    live: 'red',
    upcoming: 'teal',
    ended: 'slate',
  };

  return (
    <Screen title={t('liveTitle')} subtitle={t('liveSubtitle')}>
      <Reveal>
        <ChipRow style={styles.chips}>
          {filters.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              active={filter === f.key}
              dot={f.key === 'live'}
              dotColor={filter === f.key ? colors.onPrimary : colors.danger}
              onPress={() => setFilter(f.key)}
            />
          ))}
        </ChipRow>
      </Reveal>

      <Reveal delay={80}>
        {isLoading ? (
          <View style={styles.list}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} style={{ height: 170 }} />
            ))}
          </View>
        ) : sessions.length === 0 ? (
          <EmptyState icon="Video" title={t('liveTitle')} description={t('noSessions')} />
        ) : (
          sessions.map((session: LiveSession) => {
            const fill = session.maxParticipants
              ? Math.round((session.participantCount / session.maxParticipants) * 100)
              : 0;
            const canJoin = session.status === 'live';
            const canRegister = session.status === 'upcoming';
            return (
              <GlassCard key={session.id} variant="flat" padding={16} style={styles.card}>
                <View style={styles.head}>
                  <LinearGradient
                    colors={canJoin ? [colors.danger, colors.warning] : colors.hero}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.thumb}
                  >
                    <Icon name={canJoin ? 'Video' : 'Calendar'} size={24} color={colors.onHero} />
                  </LinearGradient>
                  <View style={styles.headInfo}>
                    <View style={styles.badgeRow}>
                      <Badge variant={statusTint[session.status] ?? 'slate'}>
                        {session.status === 'live' ? t('live') : session.status === 'upcoming' ? t('upcoming') : t('ended')}
                      </Badge>
                      <Text style={[styles.topic, { color: colors.textSubtle }]} numberOfLines={1}>
                        {session.topic}
                      </Text>
                    </View>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                      {session.title}
                    </Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Icon name="User" size={13} color={colors.textSubtle} />
                    <Text style={[styles.metaText, { color: colors.textMuted }]} numberOfLines={1}>
                      {session.instructor?.name}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Icon name="Calendar" size={13} color={colors.textSubtle} />
                    <Text style={[styles.metaText, { color: colors.textMuted }]}>
                      {formatDateTime(session.scheduledAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.capacity}>
                  <View style={styles.capacityTop}>
                    <Text style={[styles.capacityText, { color: colors.textSubtle }]}>
                      {session.participantCount}/{session.maxParticipants} {t('participants')}
                    </Text>
                    <Text style={[styles.capacityText, { color: colors.textSubtle }]}>{fill}%</Text>
                  </View>
                  <ProgressBar value={fill} height={5} color={colors.primary} />
                </View>

                {canJoin ? (
                  <Button title={t('joinNow')} icon="Video" fullWidth style={styles.action} />
                ) : canRegister ? (
                  <Button title={t('register')} icon="Plus" variant="secondary" fullWidth style={styles.action} />
                ) : null}
              </GlassCard>
            );
          })
        )}
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { marginBottom: spacing.lg },
  list: { gap: spacing.md },
  card: { marginBottom: spacing.md },
  head: { flexDirection: 'row', gap: 12 },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headInfo: { flex: 1, gap: 5 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topic: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, flex: 1 },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, letterSpacing: letterSpacing.tight },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  metaText: { fontSize: fontSize.sm },
  capacity: { marginTop: 12 },
  capacityTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  capacityText: { fontSize: fontSize.xs, fontVariant: ['tabular-nums'] },
  action: { marginTop: 14 },
});
