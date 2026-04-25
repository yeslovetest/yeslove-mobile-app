import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingTop: 10,
    paddingHorizontal: 10,
    alignSelf: "center",
    backgroundColor: "#f4f7fc",
  },
  contentContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    paddingBottom: 28,
  },
  heroSection: {
    width: "100%",
    marginBottom: 10,
  },
  detailsSection: {
    width: "100%",
    marginBottom: 8,
  },
  tabSection: {
    width: "100%",
    marginTop: 4,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  contentSection: {
    width: "100%",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 2,
    paddingTop: 4,
    paddingBottom: 8,
  },
})

export default sharedStyles