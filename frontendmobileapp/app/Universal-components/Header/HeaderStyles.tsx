import { StyleSheet } from "react-native";
import theme from "@/assets/variables/Variables";

const styles = StyleSheet.create({
  headerDistribution: {
    flexDirection: "row", 
    width: "100%", 
    paddingHorizontal: 20, 
    justifyContent: "space-between", 
    alignItems: "center"
  },
    header: {
        width: '100%',
        height: 60,
        backgroundColor: '#fff', 
        flexDirection: 'row', 
        justifyContent: "center",
        alignItems: 'center', 
        marginTop: 0,
      },
      title: {
        color: theme.colors.blackText,
        fontSize: 24,
        fontWeight: 'bold',
        alignSelf: "center",
      },
})

export default styles 