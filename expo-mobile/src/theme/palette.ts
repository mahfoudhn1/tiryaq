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
  // Sky-blue medical scheme: page #F4F9FD with white glass cards (white/65).
  background: '#F4F9FD',
  backgroundAlt: '#F0F9FF',
  surface: 'rgba(255, 255, 255, 0.65)',
  surfaceSolid: '#FFFFFF',
  glass: 'rgba(255, 255, 255, 0.65)',
  glassBorder: 'rgba(186, 230, 253, 0.8)',
  blurTint: 'light',
  border: 'rgba(186, 230, 253, 0.6)',
  text: '#0F2A3D',
  textMuted: '#5B7184',
  textSubtle: '#93A5B3',
  primary: '#0369A1',
  primarySoft: '#E0F2FE',
  onPrimary: '#FFFFFF',
  accent: '#075985',
  accentSoft: 'rgba(3, 105, 161, 0.12)',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#0284C7',
  shadow: '#075985',
  // Hero gradient: primary #0369A1 → deep #075985 → pressed #0C4A6E.
  hero: ['#0369A1', '#075985', '#0C4A6E'],
  backdrop: ['#F4F9FD', '#F0F9FF', '#F4F9FD'],
  onSuccess: '#FFFFFF',
  onDanger: '#FFFFFF',
  icon: '#5B7184',
  glow: 'rgba(3, 105, 161, 0.28)',
  glassSheen: ['rgba(56, 189, 248, 0.18)', 'rgba(56, 189, 248, 0)'],
  glassEdgeLight: 'rgba(255, 255, 255, 0.9)',
  glassFallback: 'rgba(255, 255, 255, 0.92)',
  orbPrimary: 'rgba(3, 105, 161, 0.14)',
  orbAccent: 'rgba(56, 189, 248, 0.2)',
  orbTertiary: 'rgba(2, 132, 199, 0.12)',
  tabBar: 'rgba(255, 255, 255, 0.72)',
  tabShadow: '#075985',
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
  // Dark scheme: page #061019, cards rgb(19 34 50 / 68–88%), sky hairlines rgb(156 198 235 / 20–36%).
  background: '#061019',
  backgroundAlt: '#0F1D2B',
  surface: 'rgba(19, 34, 50, 0.78)',
  surfaceSolid: '#132232',
  glass: 'rgba(19, 34, 50, 0.68)',
  glassBorder: 'rgba(156, 198, 235, 0.28)',
  blurTint: 'dark',
  border: 'rgba(156, 198, 235, 0.16)',
  text: '#EAF1F7',
  textMuted: '#9FB0BF',
  textSubtle: '#647689',
  primary: '#7DD3FC',
  primarySoft: 'rgba(125, 211, 252, 0.16)',
  onPrimary: '#0C4A6E',
  accent: '#38BDF8',
  accentSoft: 'rgba(56, 189, 248, 0.14)',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  info: '#38BDF8',
  shadow: '#000000',
  // Chrome gradient: #0369A1 → #075985 with pressed #0C4A6E depth.
  hero: ['#0369A1', '#075985', '#0C4A6E'],
  backdrop: ['#061019', '#0F1D2B', '#061019'],
  onSuccess: '#0C4A6E',
  onDanger: '#1C0505',
  icon: '#9FB0BF',
  glow: 'rgba(56, 189, 248, 0.3)',
  glassSheen: ['rgba(56, 189, 248, 0.12)', 'rgba(56, 189, 248, 0)'],
  glassEdgeLight: 'rgba(156, 198, 235, 0.3)',
  glassFallback: 'rgba(19, 34, 50, 0.88)',
  orbPrimary: 'rgba(125, 211, 252, 0.16)',
  orbAccent: 'rgba(56, 189, 248, 0.16)',
  orbTertiary: 'rgba(2, 132, 199, 0.14)',
  tabBar: 'rgba(6, 16, 25, 0.72)',
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
  teal: { light: '#0369A1', dark: '#7DD3FC' },
  blue: { light: '#0284C7', dark: '#38BDF8' },
  amber: { light: '#D97706', dark: '#FBBF24' },
  green: { light: '#059669', dark: '#34D399' },
  red: { light: '#DC2626', dark: '#F87171' },
  purple: { light: '#7C3AED', dark: '#A78BFA' },
  slate: { light: '#5B7184', dark: '#9FB0BF' },
} as const;

export type TintName = keyof typeof statusTints;

/** Translucent fill that pairs with each status tint. */
export const statusSoftTints: Record<TintName | 'primary', { light: string; dark: string }> = {
  teal: { light: 'rgba(3, 105, 161, 0.12)', dark: 'rgba(125, 211, 252, 0.16)' },
  blue: { light: 'rgba(2, 132, 199, 0.12)', dark: 'rgba(56, 189, 248, 0.16)' },
  amber: { light: 'rgba(217, 119, 6, 0.14)', dark: 'rgba(251, 191, 36, 0.18)' },
  green: { light: 'rgba(5, 150, 105, 0.12)', dark: 'rgba(52, 211, 153, 0.16)' },
  red: { light: 'rgba(220, 38, 38, 0.12)', dark: 'rgba(248, 113, 113, 0.18)' },
  purple: { light: 'rgba(124, 58, 237, 0.12)', dark: 'rgba(167, 139, 250, 0.18)' },
  slate: { light: 'rgba(91, 113, 132, 0.14)', dark: 'rgba(159, 176, 191, 0.16)' },
  primary: { light: 'rgba(3, 105, 161, 0.12)', dark: 'rgba(125, 211, 252, 0.16)' },
};

export type BadgeVariant = TintName | 'primary';
