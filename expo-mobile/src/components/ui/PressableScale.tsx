import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useReduceMotion } from '@/hooks/useA11y';

interface PressableScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Pressed scale, defaults to 0.97. */
  scaleTo?: number;
  accessibilityLabel?: string;
}

/** Wraps tappable content with a subtle animated press scale. */
export function PressableScale({
  children,
  onPress,
  onLongPress,
  disabled = false,
  style,
  scaleTo = 0.97,
  accessibilityLabel,
}: PressableScaleProps) {
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

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPressIn={() => press(scaleTo)}
        onPressOut={() => press(1)}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
