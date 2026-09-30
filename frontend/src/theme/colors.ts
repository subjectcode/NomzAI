/**
 * Nomz Mobile Design System — Color Tokens v1.0
 * Authority: Nomz_DESIGN.md Section 5 & Brand Board
 */
export const colors = {
  // Primary Palette
  primary: '#0F766E', // Deep Teal — primary brand anchor, CTAs, active states
  primaryDark: '#005C55', // Dark Teal — pressed states, dark accents
  primaryContainer: '#0F766E',
  onPrimary: '#FFFFFF',

  // Fresh & Light Mint
  freshMint: '#34D399', // Fresh Mint — positive states, success highlights
  lightMint: '#A7F3D0', // Light Mint — secondary action surface, soft badges
  mintSoft: '#ECFDF5', // Soft Mint Surface Container

  // Canvas & Surfaces
  background: '#F8FAF5', // Warm Cream — primary application canvas
  surface: '#FFFFFF', // Resting surface / elevated cards
  surfaceContainerLow: '#F2F4EF',
  surfaceContainer: '#ECEFEA',
  surfaceContainerHigh: '#E7E9E4',

  // Warm Food Urgency Accents
  warmYellow: '#FFE7B3', // Warm Yellow — food urgency, "Gunakan Segera"
  softOrange: '#FFB373', // Soft Orange — culinary accents, expiry warning
  orangeDark: '#EA580C', // Deep Orange — high urgency
  accent: '#FFB373', // Backward-compatible alias for culinary accent

  // Typography Colors
  textPrimary: '#191C1A', // Dark charcoal text
  textSecondary: '#3E4947', // Secondary readable text
  textMuted: '#6E7977', // Muted captions / hints

  // Borders & Dividers
  border: '#E1E3DE', // Standard card & input border
  borderSubtle: '#EEF0EB', // Soft divider

  // Semantic Status
  success: '#006C4B', // Success green
  error: '#BA1A1A', // Error red
  errorContainer: '#FFDAD6',
} as const;

export type ColorTokens = typeof colors;
