import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: '#f6f8fc',
    },
    contentContainer: {
        width: '100%',
        paddingTop: 14,
        paddingBottom: 34,
        paddingHorizontal: 14,
    },
    headerRow: {
        width: '100%',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    pageTitle: {
        color: theme.colors.blackText,
        fontSize: 26,
        fontWeight: '700',
    },
    pageSubtitle: {
        marginTop: 6,
        fontSize: 14,
        lineHeight: 20,
        color: theme.colors.iconNotActive,
    },
    saveButton: {
        width: '100%',
        minHeight: 52,
        paddingVertical: 13,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.primaryBlue,
        borderRadius: 14,
        marginTop: 14,
        marginBottom: 18,
        shadowColor: '#13317f',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 4,
    },
 
    saveButtonText: {
        color: "#f8fbff",
        textAlign: "center",
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    displayMsgBox: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 12,
        marginVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#eef6ff',
        borderWidth: 1,
        borderColor: '#d4e7ff',
        borderRadius: 12,
    },
    displayMsgText : {
        color: theme.colors.primaryBlue,
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '600',
    }
})

export default styles