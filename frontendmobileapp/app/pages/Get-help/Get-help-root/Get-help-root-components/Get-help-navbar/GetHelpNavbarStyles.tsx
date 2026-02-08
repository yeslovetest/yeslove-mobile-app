import theme from "@/assets/variables/Variables";
import { vw } from "@/ts/viewport-units";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
     navBarContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: vw(5),
    marginBottom: vw(5),
  },
  navBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: theme.spacing.postWidth,
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  navItem: {
    width: "50%",
    paddingVertical: 15,
    alignItems: "center",
  },
  navText: {
    fontSize: 16,
    color: theme.colors.iconNotActive,
    fontWeight: "500",
  },
  activeNavItem: {
    position: "relative",
  },
  activeNavText: {
    fontWeight: "bold",
    color: "#000",
  },
  activeIndicator: {
    width: 40,
    height: 3,
    backgroundColor: theme.colors.primaryBlue,
    position: "absolute",
    bottom: -2,
  },
})

export default styles