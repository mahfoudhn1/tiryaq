export interface Palette {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceSolid: string;
  glass: string;
  glassBorder: string;
  blurTint: 'light' | 'dark';
  border: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  accent: string;
  /** Translucent teal fill for a single highlighted element (icon button, featured chip). */
  accentSoft: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  shadow: string;
  hero: [string, string, string];
  backdrop: [string, string, string];
  /** Foreground used on `success` fills. */
  onSuccess: string;
  /** Foreground used on `danger` fills. */
  onDanger: string;
  /** Default glyph colour when a caller does not pass one. */
  icon: string;
  /** Coloured glow behind primary actions. */
  glow: string;
  /** Diagonal light sheen painted over blurred glass. */
  glassSheen: [string, string];
  /** Brighter top/left edge of a glass panel. */
  glassEdgeLight: string;
  /** Opaque-ish surface used when blur is unavailable or transparency is reduced. */
  glassFallback: string;
  /** Ambient background orbs. */
  orbPrimary: string;
  orbAccent: string;
  orbTertiary: string;
  /** Floating tab bar surface + shadow. */
  tabBar: string;
  tabShadow: string;
  /** Dimming layer behind sheets/modals. */
  scrim: string;
  /** Text and surfaces used on the dark hero gradient. */
  onHero: string;
  onHeroMuted: string;
  onHeroFaint: string;
  heroSurface: string;
  heroBorder: string;
  heroTrack: string;
  heroShine: [string, string];
}

export const lightPalette: Palette = {
  background: '#DDE7F0',
  backgroundAlt: '#EDF2F8',
  surface: 'rgba(255, 255, 255, 0.55)',
  surfaceSolid: '#FFFFFF',
  glass: 'rgba(255, 255, 255, 0.5)',
  glassBorder: 'rgba(15, 42, 61, 0.14)',
  blurTint: 'light',
  border: 'rgba(15, 42, 61, 0.08)',
  text: '#0F2A3D',
  textMuted: '#5B7184',
  textSubtle: '#93A5B3',
  primary: '#123247',
  primarySoft: '#C9DCED',
  onPrimary: '#FFFFFF',
  accent: '#1E8A82',
  accentSoft: 'rgba(30, 138, 130, 0.14)',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#2563EB',
  shadow: '#123247',
  hero: ['#0F2A3D', '#123247', '#1E8A82'],
  backdrop: ['#DDE7F0', '#EDF2F8', '#DDE7F0'],
  onSuccess: '#0F2A3D',
  onDanger: '#FFFFFF',
  icon: '#5B7184',
  glow: 'rgba(18, 50, 71, 0.28)',
  glassSheen: ['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.34)'],
  glassEdgeLight: 'rgba(255, 255, 255, 0.9)',
  glassFallback: 'rgba(255, 255, 255, 0.9)',
  orbPrimary: 'rgba(18, 50, 71, 0.14)',
  orbAccent: 'rgba(30, 138, 130, 0.2)',
  orbTertiary: 'rgba(124, 58, 237, 0.12)',
  tabBar: 'rgba(255, 255, 255, 0.72)',
  tabShadow: '#123247',
  scrim: 'rgba(15, 42, 61, 0.35)',
  onHero: '#FFFFFF',
  onHeroMuted: 'rgba(255, 255, 255, 0.82)',
  onHeroFaint: 'rgba(255, 255, 255, 0.72)',
  heroSurface: 'rgba(255, 255, 255, 0.14)',
  heroBorder: 'rgba(255, 255, 255, 0.18)',
  heroTrack: 'rgba(255, 255, 255, 0.22)',
  heroShine: ['rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0)'],
};

export const darkPalette: Palette = {
  background: '#0A1520',
  backgroundAlt: '#0F1D2B',
  surface: 'rgba(22, 36, 52, 0.55)',
  surfaceSolid: '#131F2E',
  glass: 'rgba(22, 34, 55, 0.5)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  blurTint: 'dark',
  border: 'rgba(255, 255, 255, 0.08)',
  text: '#EAF1F7',
  textMuted: '#9FB0BF',
  textSubtle: '#647689',
  primary: '#7FB6D9',
  primarySoft: 'rgba(127, 182, 217, 0.16)',
  onPrimary: '#08141F',
  accent: '#3FC7B8',
  accentSoft: 'rgba(63, 199, 184, 0.14)',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  info: '#60A5FA',
  shadow: '#000000',
  hero: ['#08141F', '#123247', '#1E8A82'],
  backdrop: ['#0A1520', '#0F1D2B', '#0A1520'],
  onSuccess: '#08141F',
  onDanger: '#1C0505',
  icon: '#9FB0BF',
  glow: 'rgba(127, 182, 217, 0.3)',
  glassSheen: ['rgba(255, 255, 255, 0.10)', 'rgba(255, 255, 255, 0.03)'],
  glassEdgeLight: 'rgba(255, 255, 255, 0.22)',
  glassFallback: 'rgba(19, 31, 46, 0.88)',
  orbPrimary: 'rgba(127, 182, 217, 0.18)',
  orbAccent: 'rgba(63, 199, 184, 0.18)',
  orbTertiary: 'rgba(167, 139, 250, 0.12)',
  tabBar: 'rgba(10, 21, 32, 0.72)',
  tabShadow: '#000000',
  scrim: 'rgba(0, 0, 0, 0.5)',
  onHero: '#FFFFFF',
  onHeroMuted: 'rgba(255, 255, 255, 0.82)',
  onHeroFaint: 'rgba(255, 255, 255, 0.72)',
  heroSurface: 'rgba(255, 255, 255, 0.14)',
  heroBorder: 'rgba(255, 255, 255, 0.18)',
  heroTrack: 'rgba(255, 255, 255, 0.22)',
  heroShine: ['rgba(255, 255, 255, 0.14)', 'rgba(255, 255, 255, 0)'],
};

/** Contextual status colours (not theme-dependent). */
export const statusTints = {
  teal: { light: '#1E8A82', dark: '#3FC7B8' },
  blue: { light: '#2563EB', dark: '#60A5FA' },
  amber: { light: '#D97706', dark: '#FBBF24' },
  green: { light: '#059669', dark: '#34D399' },
  red: { light: '#DC2626', dark: '#F87171' },
  purple: { light: '#7C3AED', dark: '#A78BFA' },
  slate: { light: '#5B7184', dark: '#9FB0BF' },
} as const;

export type TintName = keyof typeof statusTints;

/** Translucent fill that pairs with each status tint. */
export const statusSoftTints: Record<TintName | 'primary', { light: string; dark: string }> = {
  teal: { light: 'rgba(30, 138, 130, 0.12)', dark: 'rgba(63, 199, 184, 0.16)' },
  blue: { light: 'rgba(37, 99, 235, 0.12)', dark: 'rgba(96, 165, 250, 0.16)' },
  amber: { light: 'rgba(217, 119, 6, 0.14)', dark: 'rgba(251, 191, 36, 0.18)' },
  green: { light: 'rgba(5, 150, 105, 0.12)', dark: 'rgba(52, 211, 153, 0.16)' },
  red: { light: 'rgba(220, 38, 38, 0.12)', dark: 'rgba(248, 113, 113, 0.18)' },
  purple: { light: 'rgba(124, 58, 237, 0.12)', dark: 'rgba(167, 139, 250, 0.18)' },
  slate: { light: 'rgba(91, 113, 132, 0.14)', dark: 'rgba(159, 176, 191, 0.16)' },
  primary: { light: 'rgba(18, 50, 71, 0.12)', dark: 'rgba(127, 182, 217, 0.16)' },
};

export type BadgeVariant = TintName | 'primary';
