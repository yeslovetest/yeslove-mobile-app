import { StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "@/app/theme";
import type { ShadowTokens } from "@/app/theme/shadows";

export interface CardProps extends ViewProps {
  /** Elevation preset from the theme's shadow tokens. Defaults to "sm". */
  elevation?: keyof ShadowTokens;
  /** Apply standard inner padding. Defaults to true. */
  padded?: boolean;
}

/**
 * Surface container primitive: themed background, rounded corners, hairline
 * border, and an elevation shadow.
 */
export const Card = ({ elevation = "sm", padded = true, style, children, ...rest }: CardProps) => {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.card,
          borderRadius: theme.radii.xl,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
        },
        padded && { padding: theme.spacing.lg },
        theme.shadows[elevation],
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};
