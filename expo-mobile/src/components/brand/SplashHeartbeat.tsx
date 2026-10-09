import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const TRACE_LENGTH = 480;

export function SplashHeartbeat() {
  const { colors } = useTheme();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: TRACE_LENGTH,
          duration: 2_100,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [progress]);

  return (
    <View style={styles.track} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="44" viewBox="0 0 480 44" preserveAspectRatio="none">
        <Path
          d="M0 22 H104 L118 18 L130 26 L146 22 H188 L201 22 L211 17 L220 28 L232 4 L245 39 L257 16 L268 22 H312 L324 22 L336 18 L348 26 L361 22 H480"
          fill="none"
          stroke={colors.border}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <AnimatedPath
          d="M0 22 H104 L118 18 L130 26 L146 22 H188 L201 22 L211 17 L220 28 L232 4 L245 39 L257 16 L268 22 H312 L324 22 L336 18 L348 26 L361 22 H480"
          fill="none"
          stroke={colors.primary}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${TRACE_LENGTH} ${TRACE_LENGTH}`}
          strokeDashoffset={progress}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: 220, height: 44, marginTop: 22, overflow: 'hidden' },
});
