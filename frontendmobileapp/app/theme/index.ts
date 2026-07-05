import { useColorScheme } from "react-native";

import { darkColors, lightColors, palette, type ColorTokens } from "./colors";
import { radii } from "./radii";
import { shadows } from "./shadows";
import { layout, MIN_TOUCH_TARGET, spacing } from "./spacing";
import { fontSize, fontWeight, lineHeight, textVariants } from "./typography";

const typography = { fontSize, fontWeight, lineHeight, variants: textVariants };

const baseTokens = {
  spacing,
  layout,
  radii,
  shadows,
  typography,
  minTouchTarget: MIN_TOUCH_TARGET,
};

export type ColorScheme = "light" | "dark";

const makeTheme = (colors: ColorTokens, scheme: ColorScheme) => ({
  ...baseTokens,
  colors,
  scheme,
});

export const lightTheme = makeTheme(lightColors, "light");
export const darkTheme = makeTheme(darkColors, "dark");

export type Theme = ReturnType<typeof makeTheme>;

/**
 * Default (light) theme. Safe to import in static StyleSheet.create() where a
 * hook can't run. Components that should react to the system color scheme should
 * use useTheme() instead.
 */
export const theme = lightTheme;

/**
 * Returns the theme for the current system color scheme. The app currently ships
 * light-only, so this resolves to lightTheme today, but primitives built on it
 * become dark-ready automatically if dark mode is enabled later.
 */
export const useTheme = (): Theme => {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkTheme : lightTheme;
};

export { palette, spacing, layout, radii, shadows, typography, MIN_TOUCH_TARGET };
export type { ColorTokens };
