import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  type KeyboardTypeOptions,
  type TextInputProps,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, radius, fontSize, fontWeight, spacing, layout } from '@/theme';
import { useGlassConfig } from './glass';
import { Icon, type IconName } from './Icon';

interface InputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: IconName;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  returnKeyType?: TextInputProps['returnKeyType'];
  onBlur?: () => void;
  onFocus?: () => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  right?: React.ReactNode;
}

/** Glass text field with a primary focus ring and an error state. */
export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  icon,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  editable = true,
  multiline = false,
  numberOfLines,
  maxLength,
  returnKeyType,
  onBlur,
  onFocus,
  style,
  inputStyle,
  right,
}: InputProps) {
  const { colors } = useTheme();
  const config = useGlassConfig(36);
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;
  const glowColor = error ? colors.danger : colors.primary;

  return (
    <View style={style}>
      {label ? <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text> : null}

      <View
        style={[
          styles.field,
          {
            borderColor,
            shadowColor: glowColor,
            shadowOpacity: focused ? 0.22 : 0,
          },
          !editable && styles.disabled,
        ]}
      >
        {config.useBlur ? (
          <BlurView {...config.blurProps} pointerEvents="none" style={StyleSheet.absoluteFill} />
        ) : null}
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.glass }]}
        />

        {icon ? (
          <Icon name={icon} size={17} color={focused ? colors.primary : colors.icon} />
        ) : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSubtle}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          returnKeyType={returnKeyType}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          style={[styles.input, { color: colors.text }, multiline && styles.multiline, inputStyle]}
        />

        {right}
      </View>

      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs + 2,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    minHeight: layout.minTouch,
    paddingHorizontal: spacing.lg - 2,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.md,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  disabled: { opacity: 0.6 },
  error: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs + 2,
  },
});
