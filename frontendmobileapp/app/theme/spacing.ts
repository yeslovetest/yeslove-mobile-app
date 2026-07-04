import { vw } from "@/ts/viewport-units";

/**
 * 4-point spacing scale. Use these for padding, margins, and gaps so vertical and
 * horizontal rhythm stays consistent across screens.
 */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

/**
 * Layout widths reused by full-bleed content (posts, banners, page containers).
 * Kept here so screens don't recompute viewport math inline.
 */
export const layout = {
  postWidth: vw(95),
  contentWidth: "95%",
  maxFormWidth: 420,
} as const;

/** Minimum touch target (accessibility) — iOS HIG / Material both recommend 44pt. */
export const MIN_TOUCH_TARGET = 44;

export type SpacingTokens = typeof spacing;
