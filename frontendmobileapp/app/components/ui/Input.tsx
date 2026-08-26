import { useState } from "react";
import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";

import { useTheme } from "@/app/theme";

import { Text } from "./Text";

export interface InputProps extends TextInputProps {
  label?: string;
  /** Error message; when set, the field renders in the danger color. */
  error?: string;
  /** Hint shown below the field when there is no error. */
  helperText?: string;
}

/**
 * Labeled text input primitive with focus/error states and accessibility.
 * Enforces a >=44pt touch target.
 */
export const Input = ({
  label,
  error,
  helperText,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) => {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.primary
      : theme.colors.border;

  const handleFocus: NonNullable<TextInputProps["onFocus"]> = (event) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur: NonNullable<TextInputProps["onBlur"]> = (event) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <View style={styles.container}>
      {label ? (
        <Text variant="subhead" color="textSecondary" style={styles.label}>
          {label}
        </Text>
      ) : null}

      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        onFocus={handleFocus}
        onBlur={handleBlur}
        accessibilityLabel={label}
        style={[
          styles.input,
          {
            minHeight: theme.minTouchTarget,
            borderColor,
            borderRadius: theme.radii.md,
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.surface,
            paddingHorizontal: theme.spacing.md,
          },
          style,
        ]}
        {...rest}
      />

      {error ? (
        <Text variant="caption" color="danger" style={styles.helper}>
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="caption" color="textMuted" style={styles.helper}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%" },
  label: { marginBottom: 6 },
  input: { borderWidth: 1, paddingVertical: 10 },
  helper: { marginTop: 4 },
});
