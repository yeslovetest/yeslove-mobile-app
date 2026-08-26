import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 70,
    marginVertical: theme.spacing.sm,
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  profileName: {
    marginBottom: 7,
    fontWeight: "600",
    fontSize: theme.typography.fontSize.callout,
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  profileImageContainer: {
    marginLeft: 5,
    height: "100%",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
  },
  profileInfoContainer: {
    paddingStart: 10,
    justifyContent: "center",
  },
});

export default styles;
