import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
   
    settingsNavItemContainer: {
        width: theme.spacing.standardPageContentWidth,
        borderTopWidth: 0.5,
        borderBlockColor: theme.colors.footerBdColor,
        marginVertical: 5,

    },
    settingsNavItemContent: {
        alignItems: 'center',
        paddingVertical: 15,
        marginVertical: 2,
        paddingHorizontal: 50,
        backgroundColor: theme.colors.mainBkgColor,
    },

    sectionText: {
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.blackText,
    },

    settingsSubSection: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBlockColor: theme.colors.footerFontColor,
        backgroundColor: theme.colors.mainBkgColor
    },

    subSectionInput: {
        fontSize: 15,
        borderWidth: 1,
        borderBottomColor: theme.colors.footerFontColor,
        color: theme.colors.footerFontColor,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginVertical: 10,
        width: '100%',
        borderRadius: 10,
    },
    saveChangesButton: {
        backgroundColor: theme.colors.primaryBlue,
        padding: 10,
        margin: 20,
        borderRadius: 10,
    },

    saveChangesButtonText: {
        color: "#eee",
        textAlign: "center",
        fontSize: 15
    },

    /*modal */

    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },

    modalText: {
        fontSize: 18,
        textAlign: "center"
    }
})

export default styles