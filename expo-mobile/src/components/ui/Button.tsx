import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme, radius, fontSize, fontWeight, layout } from '@/theme';
import { useReduceMotion } from '@/hooks/useA11y';
import { useGlassConfig } from './glass';
import { BlurView } from 'expo-blur';
import { Icon, type IconName } from './Icon';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
}

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.full },
  md: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: radius.full },
  lg: { paddingVertical: 15, paddingHorizontal: 22, borderRadius: radius.full },
};

const textSizes: Record<ButtonSize, number> = { sm: fontSize.sm, md: fontSize.md, lg: fontSize.lg };

const iconSizes: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18 };

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors, isDark } = useTheme();
  const glass = useGlassConfig(44);
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

  const active = disabled || loading;

  const foreground: Record<ButtonVariant, string> = {
    primary: colors.onPrimary,
    secondary: colors.text,
    ghost: colors.primary,
    danger: colors.onDanger,
    success: colors.onSuccess,
  };
  const fg = foreground[variant];

  const glow: ViewStyle | null =
    variant === 'primary'
      ? {
          shadowColor: colors.primary,
          shadowOpacity: isDark ? 0.45 : 0.32,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 4,
        }
      : variant === 'danger'
        ? {
            shadowColor: colors.danger,
            shadowOpacity: isDark ? 0.4 : 0.28,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 5 },
            elevation: 3,
          }
        : null;

  return (
    <Animated.View
      style={[fullWidth && styles.fullWidth, glow, animatedStyle, style]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onPress}
        disabled={active}
        onPressIn={() => press(0.97)}
        onPressOut={() => press(1)}
        style={[
          styles.base,
          sizeStyles[size],
          variant === 'secondary' && { borderColor: colors.glassBorder },
          variant === 'ghost' && styles.transparent,
          active && styles.disabled,
        ]}
      >
        {variant === 'primary' ? (
          <LinearGradient
            colors={[colors.primary, colors.accent] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
          />
        ) : null}

        {variant === 'secondary' ? (
          <>
            {glass.useBlur ? (
              <BlurView
                {...glass.blurProps}
                pointerEvents="none"
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.glass }]}
            />
          </>
        ) : null}

        {variant === 'danger' ? (
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.danger }]}
          />
        ) : null}

        {variant === 'success' ? (
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.success }]}
          />
        ) : null}

        {loading ? (
          <ActivityIndicator size="small" color={fg} />
        ) : (
          <>
            {icon ? <Icon name={icon} size={iconSizes[size]} color={fg} strokeWidth={2.2} /> : null}
            <Text style={[styles.text, { color: fg, fontSize: textSizes[size] }, textStyle]}>
              {title}
            </Text>
            {iconRight ? (
              <Icon name={iconRight} size={iconSizes[size]} color={fg} strokeWidth={2.2} />
            ) : null}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: layout.minTouch,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  transparent: { borderColor: 'transparent' },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  text: { fontWeight: fontWeight.bold, letterSpacing: 0.1 },
});
