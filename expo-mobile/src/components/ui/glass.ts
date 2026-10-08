import { Platform } from 'react-native';
import type { BlurViewProps } from 'expo-blur';
import { useTheme } from '@/theme';
import { useReduceTransparency } from '@/hooks/useA11y';

export interface GlassConfig {
  /** False when the platform or accessibility settings want a solid surface instead. */
  useBlur: boolean;
  /** Props to spread onto `<BlurView />` (unused when `useBlur` is false). */
  blurProps: BlurViewProps;
}

/**
 * Single place that decides how frosted glass behaves per platform, theme and
 * accessibility setting. Callers never branch on `Platform` themselves.
 *
 * Android's BlurView requires a `blurTarget` ref to blur a backdrop. Without one
 * it silently falls back to a flat translucent fill, which shows up as a grey
 * haze over light surfaces — so on Android we use the solid `glassFallback`
 * surface instead and skip blur entirely.
 */
export function useGlassConfig(intensity?: number): GlassConfig {
  const { colors, isDark } = useTheme();
  const reduceTransparency = useReduceTransparency();

  const canBlur = Platform.OS === 'ios';

  const blurProps: BlurViewProps = {
    tint: colors.blurTint,
    intensity: intensity ?? (isDark ? 42 : 52),
  };

  return { useBlur: canBlur && !reduceTransparency, blurProps };
}
