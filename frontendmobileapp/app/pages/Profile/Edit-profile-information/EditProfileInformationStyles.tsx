import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    contentContainer: {
        width: '100%',
        paddingTop: 8,
        paddingBottom: 30,
    },
    headerRow: {
        width: '100%',
        marginBottom: 8,
        paddingHorizontal: 2,
    },
    pageTitle: {
        color: theme.colors.blackText,
        fontSize: 24,
        fontWeight: '700',
    },
    pageSubtitle: {
        marginTop: 4,
        fontSize: 14,
        lineHeight: 20,
        color: theme.colors.iconNotActive,
    },
    saveButton: {
        width: '100%',
        minHeight: 46,
        paddingVertical: 12,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.primaryBlue,
        borderRadius: 10,
        marginTop: 8,
        marginBottom: 30,
    },
 
    saveButtonText: {
        color: "#eee",
        textAlign: "center",
        fontSize: 16,
        fontWeight: '600',
    },
    displayMsgBox: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 15,
        marginVertical: 2,
        paddingHorizontal: 16,
    },
    displayMsgText : {
        color: theme.colors.primaryBlue,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '500',
    }
})

export default styles