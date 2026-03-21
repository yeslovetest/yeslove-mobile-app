import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    headerRow: {
        width: "100%",
        paddingHorizontal: 16,
    },
    title: {
        width: "100%",
        textAlign: "left",
        fontSize: 24,
        fontWeight: '700',
        paddingVertical: 10,
        borderBottomWidth: 1,
        color: theme.colors.blackText,
    },
    noOfNotifications: {
        width: "100%",
        textAlign: "left",
          marginTop: 8,
          fontSize: 14,
          lineHeight: 20,
        fontWeight: '400',
        color: '#5a5a5a',
    },
    blueText: {
       color: theme.colors.primaryBlue,
         fontWeight: '700'
    },
    todayAndThisWeekText: {
        width: "100%",
        marginTop: 20,
        marginBottom: 10,
        textAlign: "left",
        fontSize: 16,
        fontWeight: '700',
        color: '#222',
    }
})

export default styles