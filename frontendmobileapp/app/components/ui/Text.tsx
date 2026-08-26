import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from "react-native";

import { useTheme } from "@/app/theme";
import type { ColorTokens } from "@/app/theme/colors";
import { textVariants, type TextVariant } from "@/app/theme/typography";

export interface TextProps extends RNTextProps {
  /** Typographic role (size + weight + line-height). Defaults to "body". */
  variant?: TextVariant;
  /** Theme color token to apply. Defaults to "textPrimary". */
  color?: keyof ColorTokens;
  /** Convenience for centered text. */
  center?: boolean;
}

/**
 * Themed text primitive. Applies a typography variant and a theme color token so
 * screens never hardcode font sizes or hex colors.
 */
export const Text = ({
  variant = "body",
  color = "textPrimary",
  center,
  style,
  ...rest
}: TextProps) => {
  const theme = useTheme();
  return (
    <RNText
      style={[
        textVariants[variant],
        { color: theme.colors[color] },
        center && styles.center,
        style,
      ]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  center: { textAlign: "center" },
});
