import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme, fontSize, fontWeight, layout } from '@/theme';
import { useReduceMotion } from '@/hooks/useA11y';
import { Icon, type IconName } from './Icon';

interface SettingRowProps {
  icon: IconName;
  label: string;
  detail?: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
  last?: boolean;
}

export function SettingRow({
  icon,
  label,
  detail,
  value,
  onPress,
  toggle,
  toggleValue,
  onToggle,
  danger,
  last,
}: SettingRowProps) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const tint = danger ? colors.danger : colors.primary;

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const press = (to: number) => {
    if (reduceMotion) {
      scale.set(to);
      return;
    }
    scale.set(withTiming(to, { duration: to === 1 ? 160 : 110 }));
  };

  const content = (
    <View
      style={[
        styles.row,
        !last && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.primarySoft }]}>
        <Icon name={icon} size={17} color={tint} strokeWidth={2.1} />
      </View>

      <View style={styles.text}>
        <Text style={[styles.label, { color: danger ? colors.danger : colors.text }]}>{label}</Text>
        {detail ? <Text style={[styles.detail, { color: colors.textMuted }]}>{detail}</Text> : null}
      </View>

      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={toggleValue ? colors.onPrimary : colors.textSubtle}
        />
      ) : value ? (
        <Text style={[styles.value, { color: colors.textMuted }]}>{value}</Text>
      ) : null}

      {onPress && !toggle ? (
        <Icon name="ChevronRight" size={17} color={colors.textSubtle} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={() => press(0.99)}
          onPressOut={() => press(1)}
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: layout.minTouch,
    paddingVertical: 13,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  label: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  detail: { fontSize: fontSize.sm, marginTop: 1 },
  value: { fontSize: fontSize.sm, marginRight: 4 },
});
