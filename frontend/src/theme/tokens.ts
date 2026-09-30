/**
 * Nomz Mobile Design System — Spacing, Radii, Shadows & Typography Tokens
 * Authority: Nomz_DESIGN.md Sections 6, 13, 15, 16
 */
import { Platform } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadows = {
  // Level 1 — Resting Card Surface
  level1: Platform.select({
    ios: {
      shadowColor: '#0F766E',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  // Level 2 — Raised Action / Floating Navigation
  level2: Platform.select({
    ios: {
      shadowColor: '#0F766E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: {
      elevation: 5,
    },
    default: {},
  }),
  // Level 3 — Modal / Overlay / Camera Viewfinder
  level3: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
    },
    android: {
      elevation: 10,
    },
    default: {},
  }),
};
