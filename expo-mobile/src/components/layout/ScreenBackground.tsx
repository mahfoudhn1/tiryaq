import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme';

interface OrbProps {
  id: string;
  color: string;
  size: number;
  style: StyleProp<ViewStyle>;
}

/**
 * A soft radial glow. Rendered with SVG so the falloff stays smooth, which is
 * what gives the frosted panels something to blur on iOS.
 */
function Orb({ id, color, size, style }: OrbProps) {
  return (
    <View pointerEvents="none" style={[styles.orb, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={1} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={size} height={size} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

interface ScreenBackgroundProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Shared screen backdrop: the theme gradient plus three large ambient orbs.
 * Every screen (including Login) sits on top of this so glass has colour to
 * diffuse. Non-interactive by design.
 */
export function ScreenBackground({ children, style }: ScreenBackgroundProps) {
  const { colors } = useTheme();
  const uid = React.useId().replace(/:/g, '');

  return (
    <View style={[styles.root, { backgroundColor: colors.background }, style]}>
      <LinearGradient
        colors={colors.backdrop}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Orb id={`${uid}-a`} color={colors.orbPrimary} size={360} style={styles.orbTopLeft} />
      <Orb id={`${uid}-b`} color={colors.orbAccent} size={300} style={styles.orbRight} />
      <Orb id={`${uid}-c`} color={colors.orbTertiary} size={340} style={styles.orbBottom} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  orb: { position: 'absolute' },
  orbTopLeft: { top: -140, left: -120 },
  orbRight: { top: 150, right: -140 },
  orbBottom: { bottom: -160, left: 30 },
});
