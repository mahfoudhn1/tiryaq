import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, StyleProp, ViewStyle, LayoutChangeEvent } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme, radius, fontSize, fontWeight, layout } from '@/theme';
import { useReduceMotion } from '@/hooks/useA11y';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
  size?: 'sm' | 'md';
}

const PADDING = 4;
const GAP = 4;

/** Segmented toggle with an animated sliding thumb. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
  size = 'md',
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const [trackWidth, setTrackWidth] = useState(0);

  const count = options.length;
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const segmentWidth = count > 0 ? (trackWidth - PADDING * 2 - GAP * (count - 1)) / count : 0;

  const offset = useSharedValue(0);
  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  useEffect(() => {
    const target = index * (segmentWidth + GAP);
    offset.set(
      reduceMotion
        ? target
        : withTiming(target, { duration: 220, easing: Easing.out(Easing.cubic) }),
    );
  }, [index, segmentWidth, reduceMotion, offset]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={handleLayout}
      style={[styles.track, { backgroundColor: colors.primarySoft, borderColor: colors.border }, style]}
    >
      {segmentWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              width: segmentWidth,
              backgroundColor: colors.surfaceSolid,
              shadowColor: colors.shadow,
            },
            thumbStyle,
          ]}
        />
      ) : null}

      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={styles.segment}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text
              style={[
                styles.label,
                {
                  color: active ? colors.text : colors.textMuted,
                  fontSize: size === 'sm' ? fontSize.sm : fontSize.md,
                },
                active && styles.labelActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radius.full,
    padding: PADDING,
    gap: GAP,
    borderWidth: 1,
  },
  thumb: {
    position: 'absolute',
    left: PADDING,
    top: PADDING,
    bottom: PADDING,
    borderRadius: radius.full,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  segment: {
    flex: 1,
    minHeight: layout.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  label: { fontWeight: fontWeight.semibold },
  labelActive: { fontWeight: fontWeight.bold },
});
