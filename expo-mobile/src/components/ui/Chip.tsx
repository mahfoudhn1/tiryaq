import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme, radius, fontSize, fontWeight, spacing, layout, letterSpacing } from '@/theme';
import { useReduceMotion } from '@/hooks/useA11y';
import { useGlassConfig } from './glass';
import { Icon, type IconName } from './Icon';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: IconName;
  disabled?: boolean;
  /** Shows a leading status dot (e.g. the Live filter). */
  dot?: boolean;
  dotColor?: string;
  style?: StyleProp<ViewStyle>;
}

/** Glass pill used for filters and quick choices. */
export function Chip({ label, active = false, onPress, icon, disabled = false, dot = false, dotColor, style }: ChipProps) {
  const { colors } = useTheme();
  const config = useGlassConfig(30);
  const reduceMotion = useReduceMotion();

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const press = (to: number) => {
    if (reduceMotion) {
      scale.set(to);
      return;
    }
    scale.set(withTiming(to, { duration: to === 1 ? 160 : 110 }));
  };

  const fg = active ? colors.onPrimary : colors.textMuted;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => press(0.96)}
        onPressOut={() => press(1)}
        style={[
          styles.chip,
          {
            borderColor: active ? colors.primary : colors.border,
            backgroundColor: active ? colors.primary : config.useBlur ? 'transparent' : colors.glassFallback,
          },
          disabled && styles.disabled,
          style,
        ]}
      >
        {active ? (
          <LinearGradient
            colors={[colors.primary, colors.accent] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
          />
        ) : config.useBlur ? (
          <BlurView {...config.blurProps} pointerEvents="none" style={StyleSheet.absoluteFill} />
        ) : null}
        {dot ? <View style={[styles.dot, { backgroundColor: dotColor ?? fg }]} /> : null}
        {icon ? <Icon name={icon} size={14} color={fg} strokeWidth={2.2} /> : null}
        <Text style={[styles.label, { color: fg }]} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

interface ChipRowProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/** Horizontally scrollable row of chips with consistent gap. */
export function ChipRow({ children, style, contentContainerStyle }: ChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={[styles.row, contentContainerStyle]}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: layout.minTouch - 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    overflow: 'hidden',
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.tight,
  },
  disabled: { opacity: 0.5 },
  dot: { width: 7, height: 7, borderRadius: radius.full },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxs,
  },
});
