import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';
import { useReduceMotion } from '@/hooks/useA11y';

interface ProgressBarProps {
  value: number;
  /** Solid threshold colour. When omitted the bar uses the brand gradient. */
  color?: string;
  height?: number;
  trackColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({ value, color, height = 7, trackColor, style }: ProgressBarProps) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const [width, setWidth] = useState(0);

  const clamped = Math.min(100, Math.max(0, value));
  const progress = useSharedValue(0);

  useEffect(() => {
    const target = (clamped / 100) * width;
    progress.set(
      reduceMotion ? target : withTiming(target, { duration: 520, easing: Easing.out(Easing.cubic) }),
    );
  }, [clamped, width, reduceMotion, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: progress.value }));

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={handleLayout}
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: trackColor ?? colors.border },
        style,
      ]}
    >
      <Animated.View style={[styles.fill, { borderRadius: height / 2 }, fillStyle]}>
        {width > 0 ? (
          color ? (
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: color }]} />
          ) : (
            <LinearGradient
              colors={[colors.primary, colors.accent] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
            />
          )
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%', overflow: 'hidden' },
});
