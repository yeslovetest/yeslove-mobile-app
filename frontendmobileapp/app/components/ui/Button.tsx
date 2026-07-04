import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";

import { useTheme, type Theme } from "@/app/theme";

import { Text } from "./Text";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  /** Optional element rendered before the title (e.g. an icon). */
  leading?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Defaults to the button title for screen readers. */
  accessibilityLabel?: string;
}

const SIZE_HEIGHT: Record<ButtonSize, number> = { sm: 40, md: 48, lg: 52 };

const resolveColors = (theme: Theme, variant: ButtonVariant) => {
  switch (variant) {
    case "secondary":
      return { bg: theme.colors.surface, border: theme.colors.primary, text: theme.colors.primary };
    case "ghost":
      return { bg: "transparent", border: "transparent", text: theme.colors.primary };
    case "danger":
      return {
        bg: theme.colors.danger,
        border: theme.colors.danger,
        text: theme.colors.textInverse,
      };
    case "primary":
    default:
      return {
        bg: theme.colors.primary,
        border: theme.colors.primary,
        text: theme.colors.textOnPrimary,
      };
  }
};

/**
 * Accessible button primitive. Enforces a >=44pt touch target, exposes button
 * role/state to screen readers, and handles disabled/loading states.
 */
export const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  leading,
  style,
  accessibilityLabel,
}: ButtonProps) => {
  const theme = useTheme();
  const c = resolveColors(theme, variant);
  const isInactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: Math.max(SIZE_HEIGHT[size], theme.minTouchTarget),
          paddingHorizontal: theme.spacing.xl,
          borderRadius: theme.radii.md,
          backgroundColor: c.bg,
          borderColor: c.border,
        },
        fullWidth && styles.fullWidth,
        pressed && !isInactive && styles.pressed,
        isInactive && styles.inactive,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={c.text} />
      ) : (
        <View style={styles.content}>
          {leading}
          <Text variant="callout" style={{ color: c.text }}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fullWidth: { width: "100%" },
  pressed: { opacity: 0.85 },
  inactive: { opacity: 0.5 },
});
