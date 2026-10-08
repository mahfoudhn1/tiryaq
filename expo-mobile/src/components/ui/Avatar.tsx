import { View, Text, Image, StyleSheet, ViewStyle, ImageStyle, TextStyle } from 'react-native';
import { useTheme } from '@/theme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  initials: string;
  src?: string;
  size?: AvatarSize;
  style?: ViewStyle;
  alt?: string;
}

const sizeMap: Record<AvatarSize, { size: number; fontSize: number }> = {
  sm: { size: 32, fontSize: 11 },
  md: { size: 42, fontSize: 14 },
  lg: { size: 56, fontSize: 18 },
  xl: { size: 72, fontSize: 24 },
};

export function Avatar({ initials, src, size = 'md', style, alt }: AvatarProps) {
  const { colors } = useTheme();
  const { size: dimension, fontSize: textSize } = sizeMap[size];

  if (src) {
    return (
      <Image
        source={{ uri: src }}
        accessibilityLabel={alt ?? initials}
        style={[
          styles.image,
          { width: dimension, height: dimension, borderRadius: dimension / 2 },
          style as ImageStyle,
        ]}
      />
    );
  }

  const labelStyle: TextStyle = { fontSize: textSize };

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: colors.primarySoft,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: colors.primary }, labelStyle]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { resizeMode: 'cover' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  label: { fontWeight: '700', letterSpacing: 0.3 },
});
