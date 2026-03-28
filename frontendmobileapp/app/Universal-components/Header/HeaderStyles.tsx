import { StyleSheet } from "react-native";
import theme from "@/assets/variables/Variables";

const styles = StyleSheet.create({
  headerDistribution: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 14,
    justifyContent: "space-between",
    alignItems: "center"
  },
  homeHeaderDistribution: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 14,
    justifyContent: "flex-start",
    alignItems: "center"
  },
  backButton: {
    position: "absolute",
    left: 20,
  },
  header: {
    width: '100%',
    minHeight: 58,
    paddingVertical: 10,
    backgroundColor: '#fff',
    justifyContent: "center",
    alignItems: 'center',
    marginTop: 0,
  },
  title: {
    color: theme.colors.blackText,
    fontSize: 20,
    fontWeight: '700',
    alignSelf: "center",
    maxWidth: '72%',
    textAlign: 'center',
    flexShrink: 1,
  },
  homeTitle: {
    marginLeft: 12,
    alignSelf: "flex-start",
    textAlign: "left",
    maxWidth: "58%",
  },
  homeMessagesIcon: {
    marginLeft: "auto",
  },
  homeActions: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
  },
  homeActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f6fb",
    borderWidth: 1,
    borderColor: "#e7edf8",
    justifyContent: "center",
    alignItems: "center",
  },
  homeActionSpacing: {
    marginLeft: 10,
  },
  chatbotHeader: {
    flexDirection: "row",
    width: "23%",
    justifyContent: "space-between",
    alignItems: "center"
  },
  assistantButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  assistantBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eef4ff",
    borderWidth: 1,
    borderColor: "#d5e4ff",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  assistantGlow: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#dce8ff",
  },
  assistantImage: {
    width: 26,
    height: 26,
  },
})

export default styles 