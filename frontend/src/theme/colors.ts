/**
 * Nomz Design System Tokens - M5 Locked Palette
 * Warm, fresh, clean, mobile-first consumer food app.
 */
export const colors = {
  primary: '#5F7A61',
  primaryDark: '#405A43',
  accent: '#E89B5B',
  background: '#FAF8F3',
  surface: '#FFFFFF',
  textPrimary: '#242622',
  textSecondary: '#6F746C',
  border: '#E7E5DE',
  success: '#4F7A57',
  error: '#C65A4B',
} as const;

export type ColorTokens = typeof colors;
