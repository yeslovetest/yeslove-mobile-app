import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const Styles = StyleSheet.create({
  filterRow: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: theme.spacing.sm,
  },
  dropdownToggle: {
    backgroundColor: theme.colors.surfaceAlt,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.md,
    alignSelf: "flex-end",
  },
  dropdownToggleText: {
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: 12,
    width: "85%",
  },
  labelText: {
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 10,
    borderRadius: theme.radii.sm,
    marginBottom: 10,
  },
  inputWithMargin: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 10,
    borderRadius: theme.radii.sm,
    marginBottom: theme.spacing.xl,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: theme.colors.textMuted,
  },
});

export default Styles;
