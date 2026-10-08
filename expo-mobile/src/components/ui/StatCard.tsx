import { View, Text, StyleSheet, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import {
  useTheme,
  fontSize,
  fontWeight,
  letterSpacing,
  statusTints,
  statusSoftTints,
  type TintName,
} from '@/theme';
import { useReduceMotion } from '@/hooks/useA11y';
import { GlassCard } from './GlassCard';
import { Icon, type IconName } from './Icon';
import { ProgressBar } from './ProgressBar';

interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
  icon?: IconName;
  tint?: TintName;
  trend?: string;
  trendUp?: boolean;
  progress?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function StatCard({
  label,
  value,
  detail,
  icon,
  tint = 'teal',
  trend,
  trendUp,
  progress,
  onPress,
  style,
}: StatCardProps) {
  const { colors, isDark } = useTheme();
  const reduceMotion = useReduceMotion();
  const scheme = isDark ? 'dark' : 'light';
  const accent = statusTints[tint][scheme];
  const soft = statusSoftTints[tint][scheme];

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const press = (to: number) => {
    if (reduceMotion) {
      scale.set(to);
      return;
    }
    scale.set(withTiming(to, { duration: to === 1 ? 160 : 110 }));
  };

  const body = (
    <GlassCard variant="flat" padding={14} style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.textMuted }]} numberOfLines={1}>
          {label}
        </Text>
        {icon ? (
          <LinearGradient
            colors={[soft, 'transparent'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.iconBox, { borderColor: accent }]}
          >
            <Icon name={icon} size={15} color={accent} strokeWidth={2.2} />
          </LinearGradient>
        ) : null}
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
        {detail ? <Text style={[styles.detail, { color: colors.textMuted }]}>{detail}</Text> : null}
      </View>

      {progress !== undefined ? (
        <View style={styles.progress}>
          <ProgressBar value={progress} color={accent} height={6} />
        </View>
      ) : null}

      {trend ? (
        <Text style={[styles.trend, { color: trendUp ? colors.success : colors.danger }]}>
          {trendUp ? '+' : ''}
          {trend}
        </Text>
      ) : null}
    </GlassCard>
  );

  if (onPress) {
    return (
      <Animated.View style={[styles.pressable, animatedStyle]}>
        <Pressable
          onPress={onPress}
          onPressIn={() => press(0.97)}
          onPressOut={() => press(1)}
        >
          {body}
        </Pressable>
      </Animated.View>
    );
  }
  return body;
}

const styles = StyleSheet.create({
  pressable: { flexGrow: 1, flexBasis: '46%', minHeight: 108 },
  card: { minHeight: 108, flexGrow: 1, flexBasis: '46%' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.micro,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 10 },
  value: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.heavy,
    letterSpacing: letterSpacing.display,
    fontVariant: ['tabular-nums'],
  },
  detail: { fontSize: fontSize.sm },
  progress: { marginTop: 12 },
  trend: { marginTop: 8, fontSize: fontSize.xs, fontWeight: fontWeight.bold, fontVariant: ['tabular-nums'] },
});
