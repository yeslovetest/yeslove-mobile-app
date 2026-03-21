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
  chatbotHeader: {
    flexDirection: "row",
    width: "23%",
    justifyContent: "space-between",
    alignItems: "center"
  }
})

export default styles 