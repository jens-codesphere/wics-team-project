import type { ViewStyle } from 'react-native';

/**
 * Outsy design tokens — the single source of truth for the pastel visual
 * system (warm off-white canvas, black editorial typography, oversized
 * rounded geometry, restrained pastels).
 */

export const colors = {
  // Surfaces
  canvas: '#F7F6F4',
  surface: '#FFFFFF',
  ink: '#111111',
  textSecondary: '#77736F',
  hairline: '#E7E4E1',

  // Pastel palette
  blush: '#F1DED4', // welcome / personal / profile / onboarding
  peach: '#EBCFC3',
  butter: '#F2DC78', // highlight / recommended / positive action / winner
  sage: '#96A36D', // location / outdoors / map
  mint: '#C7DEDA', // groups / collaboration / members
  powderBlue: '#B5C9EB', // recommendations / informational content
  lavender: '#B9C0EF', // voting / selection / alternatives
  lilac: '#DEC5EE', // voting / selection / alternatives

  // Controls
  chipBackground: '#EFEDE9',
  chipText: '#5F5B57',
  inputBackground: '#EFEDE9',

  // Semantic
  success: '#6F8F68',
  warning: '#D8A94A',
  error: '#C96F65',
  info: '#7898C4',

  // Utility
  onInk: '#FFFFFF',
  tabSurface: 'rgba(255,255,255,0.92)',
} as const;

export type ColorToken = keyof typeof colors;

/** 4px base grid. */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  section: 48,
  display: 64,
} as const;

export const radii = {
  chip: 12,
  input: 18,
  button: 20,
  card: 26,
  cardLarge: 28,
  hero: 32,
  sheet: 32,
  pill: 999,
} as const;

export const fonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
} as const;

export type FontWeightName = keyof typeof fonts;

export const typography = {
  display: { fontFamily: fonts.medium, fontSize: 40, lineHeight: 44 },
  h1: { fontFamily: fonts.medium, fontSize: 32, lineHeight: 37 },
  h2: { fontFamily: fonts.semibold, fontSize: 26, lineHeight: 31 },
  h3: { fontFamily: fonts.semibold, fontSize: 21, lineHeight: 26 },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 23 },
  bodyLarge: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 17 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  micro: { fontFamily: fonts.semibold, fontSize: 10, lineHeight: 13 },
} as const;

export type TypographyVariant = keyof typeof typography;

/** Very subtle shadows only — cards prefer pastel fills over dark elevation. */
export const shadows = {
  soft: {
    shadowColor: '#111111',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  } satisfies ViewStyle,
  floating: {
    shadowColor: '#111111',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  } satisfies ViewStyle,
} as const;

export const layout = {
  screenPadding: 24,
  cardPadding: 20,
  cardGap: 16,
  sectionGap: 32,
  minTouchTarget: 44,

  tabBarHeight: 72,
  tabBarSideInset: 24,
  tabBarBottomInset: 12,
  tabItemSize: 48,
  tabItemRadius: 17,
  /** Scroll padding so content clears the floating tab bar + home indicator. */
  tabBarContentPadding: 104,
  scrollBottomPadding: 32,
} as const;

export const motion = {
  press: 130,
  card: 200,
  sheet: 280,
} as const;

export const brand = {
  name: 'outsy',
} as const;
