/**
 * Corner-radius scale, matching the radii already used across the app
 * (6 / 8 / 10 / 12-14 / 18 and pill).
 */
export const radii = {
  none: 0,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
  xxl: 18,
  pill: 999,
} as const;

export type RadiiTokens = typeof radii;
