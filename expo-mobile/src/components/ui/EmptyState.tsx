import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, radius, fontSize, fontWeight } from '@/theme';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <GlassCard variant="flat" padding={0}>
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primarySoft, 'transparent'] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.iconBox, { borderColor: colors.primary }]}
        >
          <Icon name={icon} size={26} color={colors.primary} strokeWidth={2} />
        </LinearGradient>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
        {actionLabel && onAction ? (
          <View style={styles.action}>
            <Button title={actionLabel} onPress={onAction} size="sm" />
          </View>
        ) : null}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 28 },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  action: { marginTop: 18 },
});
