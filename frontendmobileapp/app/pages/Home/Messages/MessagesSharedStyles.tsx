import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const messagesSharedStyles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        paddingHorizontal: 10,
    },
    contentContainer: {
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
        paddingBottom: 24,
    },
    messagesText: {
        width: "100%",
        textAlign: "left",
        fontSize: 24,
        fontWeight: '700',
        paddingVertical: 10,
        color: theme.colors.blackText,
    },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: "100%",
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        
    },

    filterButton: {
        minWidth: 60,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        marginRight: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },

    filterButtonActive: {
        backgroundColor: "#7296ED"
    },

    filterButtonInactive: {
        borderWidth: 1,
        borderColor: theme.colors.primaryBlue,
        backgroundColor: '#fff',
    },

    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },

    filterButtonTextActive: {
        color: '#fff',
    },

    filterButtonTextInactive: {
        color: theme.colors.primaryBlue,
    },


})

export default messagesSharedStyles