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
    tabRow: {
        width: '100%',
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
        marginBottom: 6,
    },
    tabButton: {
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
    },
    tabButtonActive: {
        backgroundColor: '#E6F0FF',
        borderColor: theme.colors.primaryBlue,
    },
    tabButtonInactive: {
        backgroundColor: '#F6F7FA',
        borderColor: '#DADDE5',
    },
    tabButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    tabButtonTextActive: {
        color: theme.colors.primaryBlue,
    },
    tabButtonTextInactive: {
        color: '#546074',
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