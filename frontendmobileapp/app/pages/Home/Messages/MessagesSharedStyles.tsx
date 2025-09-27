import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const messagesSharedStyles = StyleSheet.create({
    container: {
        flex: 1,
        width: "95%",
    },
    contentContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    messagesText: {
        width: "95%",
        textAlign: "left",
        fontSize: 25,
        fontWeight: '700',
        paddingVertical: 12,
        color: theme.colors.blackText,
    },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginLeft: 15,
        width: "95%",
        paddingVertical: 15,
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