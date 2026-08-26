import type { TextStyle } from "react-native";

/**
 * Font-size scale, derived from the sizes most used across the app
 * (11–16 clustered, with 18/20/24/28 for headings).
 */
export const fontSize = {
  caption: 12,
  footnote: 13,
  subhead: 14,
  body: 15,
  callout: 16,
  title3: 18,
  title2: 20,
  title1: 24,
  display: 28,
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const satisfies Record<string, TextStyle["fontWeight"]>;

export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
} as const;

/**
 * Named text variants used by the <Text> primitive. Each is a ready-to-spread
 * TextStyle (minus color, which comes from theme tokens at render time).
 */
export const textVariants = {
  display: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    lineHeight: Math.round(fontSize.display * lineHeight.tight),
  },
  title1: {
    fontSize: fontSize.title1,
    fontWeight: fontWeight.bold,
    lineHeight: Math.round(fontSize.title1 * lineHeight.tight),
  },
  title2: {
    fontSize: fontSize.title2,
    fontWeight: fontWeight.semibold,
    lineHeight: Math.round(fontSize.title2 * lineHeight.tight),
  },
  title3: {
    fontSize: fontSize.title3,
    fontWeight: fontWeight.semibold,
    lineHeight: Math.round(fontSize.title3 * lineHeight.normal),
  },
  body: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    lineHeight: Math.round(fontSize.body * lineHeight.normal),
  },
  bodyStrong: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    lineHeight: Math.round(fontSize.body * lineHeight.normal),
  },
  callout: {
    fontSize: fontSize.callout,
    fontWeight: fontWeight.medium,
    lineHeight: Math.round(fontSize.callout * lineHeight.normal),
  },
  subhead: {
    fontSize: fontSize.subhead,
    fontWeight: fontWeight.medium,
    lineHeight: Math.round(fontSize.subhead * lineHeight.normal),
  },
  footnote: {
    fontSize: fontSize.footnote,
    fontWeight: fontWeight.regular,
    lineHeight: Math.round(fontSize.footnote * lineHeight.normal),
  },
  caption: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.regular,
    lineHeight: Math.round(fontSize.caption * lineHeight.normal),
  },
} as const satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;
export type Typography = {
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  lineHeight: typeof lineHeight;
  variants: typeof textVariants;
};
