import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, radius, fontSize, fontWeight, statusTints, statusSoftTints, letterSpacing, type BadgeVariant } from '@/theme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
  /** Shows a leading status dot. */
  dot?: boolean;
}

export function Badge({ children, variant = 'slate', style, dot = false }: BadgeProps) {
  const { colors, isDark } = useTheme();
  const scheme = isDark ? 'dark' : 'light';
  const textColor = variant === 'primary' ? colors.primary : statusTints[variant][scheme];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: statusSoftTints[variant][scheme] },
        style,
      ]}
    >
      {dot ? <View style={[styles.dot, { backgroundColor: textColor }]} /> : null}
      <Text style={[styles.text, { color: textColor }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.full,
    paddingHorizontal: 9,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  dot: { width: 5, height: 5, borderRadius: radius.full },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.micro,
  },
});
