import React from 'react';
import { Image, View } from 'react-native';
import { useTheme } from '@/theme';

const logo = require('../../../assets/tiryaqlogonobg.png');

export function TiryaqLogo({ size = 190 }: { size?: number }) {
  const { isDark } = useTheme();

  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Tiryaq">
      <Image
        source={logo}
        resizeMode="contain"
        style={{ width: size, height: size * (832 / 1280), tintColor: isDark ? '#EAF1F7' : undefined }}
      />
    </View>
  );
}
