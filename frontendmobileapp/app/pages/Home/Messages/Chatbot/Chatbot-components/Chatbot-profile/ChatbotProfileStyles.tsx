import { StyleSheet } from "react-native";

import { theme } from "@/app/theme";

const styles2 = StyleSheet.create({
  botProfile: {
    marginLeft: -10,
    width: 45,
    height: 45,
    borderRadius: "50%",
    marginRight: 9,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    overflow: "hidden",
  },
  botProfileImagee: {
    width: 60,
    height: 60,
  },
});

export default styles2;
