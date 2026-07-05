/**
 * Raw color palette — the only place literal color values live. Semantic tokens
 * (below) reference these. Values are drawn from the colors already used across
 * the app so the design system matches the existing look.
 */
export const palette = {
  white: "#ffffff",
  black: "#000000",

  // Brand blue
  blue600: "#244ec0",
  blue500: "#2d5be3",
  blue400: "#7296ed",
  blue100: "#e7ecf4",
  blue50: "#eef3ff",

  // Accent (banners / highlights)
  orange500: "#e49114",

  // Slate / neutral ramp
  slate900: "#0f172a",
  slate800: "#1f2a3d",
  slate700: "#334155",
  slate600: "#516077",
  slate500: "#6b7280",
  slate400: "#94a3b8",
  slate300: "#cbd5e1",
  slate200: "#e2e8f0",
  slate100: "#e5e7eb",
  slate50: "#f8fafc",

  // Off-whites used as page/surface backgrounds
  paper: "#fafafa",
  paperAlt: "#f7f8fa",

  // Status
  red500: "#dc2626",
  green500: "#16a34a",
  amber500: "#d97706",
} as const;

/**
 * Semantic color tokens for light mode. Screens and primitives should reference
 * these (e.g. colors.textPrimary) rather than raw hex values.
 */
export interface ColorTokens {
  primary: string;
  primaryStrong: string;
  primarySoft: string;
  accent: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  textOnPrimary: string;
  border: string;
  borderStrong: string;
  danger: string;
  success: string;
  warning: string;
  icon: string;
  iconActive: string;
  disabled: string;
  overlay: string;
}

export const lightColors: ColorTokens = {
  // Brand
  primary: palette.blue500,
  primaryStrong: palette.blue600,
  primarySoft: palette.blue50,
  accent: palette.orange500,

  // Surfaces
  background: palette.paper,
  surface: palette.white,
  surfaceAlt: palette.paperAlt,
  card: palette.white,

  // Text
  textPrimary: palette.slate900,
  textSecondary: palette.slate600,
  textMuted: palette.slate500,
  textInverse: palette.white,
  textOnPrimary: palette.white,

  // Lines / borders
  border: palette.slate200,
  borderStrong: palette.slate300,

  // Status
  danger: palette.red500,
  success: palette.green500,
  warning: palette.amber500,

  // Interactive
  icon: palette.slate500,
  iconActive: palette.blue500,
  disabled: palette.slate200,
  overlay: "rgba(15, 23, 42, 0.5)",
} as const;

/**
 * Dark-mode tokens. The app currently ships light-only (app.json
 * userInterfaceStyle: "light"), but keeping a parallel dark set means primitives
 * that read from useTheme() are dark-ready when/if dark mode is enabled.
 */
export const darkColors: ColorTokens = {
  primary: palette.blue400,
  primaryStrong: palette.blue500,
  primarySoft: palette.slate800,
  accent: palette.orange500,

  background: palette.slate900,
  surface: palette.slate800,
  surfaceAlt: palette.slate700,
  card: palette.slate800,

  textPrimary: palette.slate50,
  textSecondary: palette.slate300,
  textMuted: palette.slate400,
  textInverse: palette.slate900,
  textOnPrimary: palette.white,

  border: palette.slate700,
  borderStrong: palette.slate600,

  danger: palette.red500,
  success: palette.green500,
  warning: palette.amber500,

  icon: palette.slate400,
  iconActive: palette.blue400,
  disabled: palette.slate700,
  overlay: "rgba(0, 0, 0, 0.6)",
};
