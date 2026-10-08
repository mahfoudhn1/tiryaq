export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** 8pt rhythm used for vertical layout. */
export const rhythm = {
  half: 4,
  unit: 8,
  third: 12,
  half2: 16,
  double: 24,
  triple: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  card: 24,
  pill: 28,
  full: 999,
} as const;

export const fontSize = {
  caption: 11,
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  display: 28,
  hero: 34,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
} as const;

export const letterSpacing = {
  micro: 0.8,
  wide: 1.4,
  tight: -0.4,
  title: -0.6,
  display: -0.8,
} as const;

export const lineHeight = {
  caption: 14,
  sm: 16,
  md: 20,
  lg: 24,
} as const;

/** Shared layout constants (screen chrome, touch targets, floating tab bar). */
export const layout = {
  screenPadding: 20,
  cardGap: 14,
  cardPadding: 18,
  minTouch: 44,
  topBarHeight: 56,
  tabBarInset: 16,
  tabBarHeight: 64,
  tabBarClearance: 120,
} as const;

export * from './palette';
export * from './ThemeProvider';
