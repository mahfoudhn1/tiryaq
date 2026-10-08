import React from 'react';
import { View, StyleSheet, Text, type ViewStyle, type TextStyle, type StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, radius, fontSize, fontWeight, letterSpacing } from '@/theme';
import { useGlassConfig } from './glass';

export type GlassVariant = 'default' | 'elevated' | 'accent' | 'flat';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  intensity?: number;
  /** Shorthand for `variant="accent"` kept for backward compatibility. */
  accent?: boolean;
  variant?: GlassVariant;
}

/**
 * Frosted panel. The outer view carries the shadow (so it is not clipped) and
 * the inner view clips the blur, sheen and edge light to the rounded corners.
 * Repeating list items should use `variant="flat"` to avoid a blur per row.
 */
export function GlassCard({
  children,
  style,
  padding = 16,
  intensity,
  accent = false,
  variant,
}: GlassCardProps) {
  const { colors, isDark } = useTheme();
  const config = useGlassConfig(intensity);
  const resolved: GlassVariant = variant ?? (accent ? 'accent' : 'default');
  const blurred = config.useBlur && resolved !== 'flat';
  const elevated = resolved === 'elevated';

  return (
    <View
      style={[
        styles.shadowWrap,
        {
          shadowColor: colors.shadow,
          shadowOpacity: isDark ? 0.35 : 0.08,
          elevation: elevated ? (isDark ? 10 : 6) : isDark ? 6 : 3,
        },
        elevated && styles.elevated,
        style,
      ]}
    >
      <View
        style={[
          styles.clip,
          {
            borderColor: resolved === 'accent' ? colors.primary : colors.border,
            backgroundColor: blurred
              ? 'transparent'
              : resolved === 'accent'
                ? colors.primarySoft
                : colors.glassFallback,
          },
        ]}
      >
        {blurred ? (
          <BlurView
            {...config.blurProps}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
          />
        ) : null}

        {blurred ? (
          <LinearGradient
            colors={colors.glassSheen}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
          />
        ) : null}

        {resolved === 'accent' ? (
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.primarySoft }]}
          />
        ) : null}

        <LinearGradient
          colors={[colors.glassEdgeLight, 'transparent'] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
          style={styles.edge}
        />

        <View style={[styles.content, { padding }]}>{children}</View>
      </View>
    </View>
  );
}

interface GlassCardHeaderProps {
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

/** Standard card header: optional icon tile, title, subtitle and a trailing slot. */
export function GlassCardHeader({ title, subtitle, trailing, icon, style }: GlassCardHeaderProps) {
  const { colors } = useTheme();
  const titleStyle: TextStyle = { color: colors.text };

  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerLeft}>
        {icon ? (
          <View style={[styles.headerIcon, { backgroundColor: colors.primarySoft }]}>{icon}</View>
        ) : null}
        <View style={styles.headerText}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      {trailing}
    </View>
  );
}

interface GlassSurfaceProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  intensity?: number;
  /** Rounds the top corners only — used by the header bar. */
  square?: boolean;
}

/** Lighter-weight frosted surface used for bars and chrome. */
export function GlassSurface({
  children,
  style,
  padding = 0,
  intensity,
  square = false,
}: GlassSurfaceProps) {
  const { colors } = useTheme();
  const config = useGlassConfig(intensity);
  const shape = square ? styles.square : styles.surface;

  return (
    <View
      style={[
        shape,
        {
          borderColor: colors.border,
          backgroundColor: config.useBlur ? 'transparent' : colors.glassFallback,
        },
        style,
      ]}
    >
      {config.useBlur ? (
        <BlurView {...config.blurProps} pointerEvents="none" style={StyleSheet.absoluteFill} />
      ) : null}
      {config.useBlur ? (
        <LinearGradient
          colors={colors.glassSheen}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={[styles.surfaceContent, { padding }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: radius.card,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
  },
  elevated: {
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 32,
  },
  clip: {
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    flexGrow: 1,
  },
  edge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  content: { flexGrow: 1 },
  surface: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    flexGrow: 1,
  },
  square: {
    borderWidth: 1,
    overflow: 'hidden',
    flexGrow: 1,
  },
  surfaceContent: { flexGrow: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: 1,
  },
});
