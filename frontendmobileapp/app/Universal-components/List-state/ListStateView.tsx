import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { theme } from "@/app/theme";

interface Props {
  /** Show a spinner with `loadingText` instead of the empty message. */
  loading?: boolean;
  loadingText?: string;
  /** Message shown when there is nothing to display and we are not loading. */
  emptyText: string;
}

/**
 * Shared placeholder for data lists. Mirrors the Timeline state pattern:
 * a centred spinner while loading, or a muted message when the list is empty.
 */
const ListStateView = ({ loading = false, loadingText = "Loading...", emptyText }: Props) => (
  <View style={styles.centerState} accessibilityRole="text">
    {loading ? (
      <>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.stateText}>{loadingText}</Text>
      </>
    ) : (
      <Text style={styles.stateText}>{emptyText}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  centerState: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 6,
  },
  stateText: {
    fontSize: theme.typography.fontSize.footnote,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});

export default ListStateView;
