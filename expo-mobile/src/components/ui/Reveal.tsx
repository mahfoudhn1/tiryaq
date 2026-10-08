import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useReduceMotion } from '@/hooks/useA11y';

interface RevealProps {
  children: React.ReactNode;
  /** Stagger offset in ms; cap the sequence at ~6 items. */
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/** Fades/slides a section in on mount. No-op under reduce-motion. */
export function Reveal({ children, delay = 0, style }: RevealProps) {
  const reduceMotion = useReduceMotion();

  if (reduceMotion) {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View entering={FadeInDown.duration(320).delay(delay)} style={style}>
      {children}
    </Animated.View>
  );
}
