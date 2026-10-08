import React from 'react';
import { View, Text, ScrollView, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme, spacing, fontSize, fontWeight, letterSpacing, layout } from '@/theme';
import { useTranslation } from '@/i18n';
import { ScreenBackground } from './ScreenBackground';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  contentStyle?: ViewStyle;
}

export function Screen({
  children,
  scroll = true,
  title,
  subtitle,
  right,
  contentStyle,
}: ScreenProps) {
  const { colors } = useTheme();
  const { isRTL } = useTranslation();

  const header =
    title || subtitle || right ? (
      <View style={styles.header}>
        <View style={styles.headerText}>
          {title ? <Text style={[styles.title, { color: colors.text }]}>{title}</Text> : null}
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>
        {right}
      </View>
    ) : null;

  const inner = (
    <View style={[styles.content, contentStyle]}>
      {header}
      {children}
    </View>
  );

  return (
    <ScreenBackground style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {inner}
        </ScrollView>
      ) : (
        <View style={styles.scrollContent}>{inner}</View>
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: layout.screenPadding,
    paddingBottom: layout.tabBarClearance,
  },
  content: { width: '100%' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerText: { flex: 1 },
  title: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.heavy,
    letterSpacing: letterSpacing.display,
  },
  subtitle: { fontSize: fontSize.md, marginTop: 6, lineHeight: 20 },
});
