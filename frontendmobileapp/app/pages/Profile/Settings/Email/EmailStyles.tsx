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

    saveButton: {
        width: 100,
        paddingVertical: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.primaryBlue,
        borderRadius: 10,
        marginBottom: 50
    },

    saveButtonText: {
        color: "#eee",
        textAlign: "center",
        fontSize: 19
    },
    mainHeaderText: {
        backgroundColor: theme.colors.mainBkgColor,
        fontSize: 15,
        paddingVertical: 10,
        paddingHorizontal: 10,
        color: theme.colors.blackText,
        fontWeight: 'bold'
    },
    headerText2: {

        paddingVertical: 10,
        fontSize: 17,
        paddingHorizontal: 0,
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

    sectionText: {
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.blackText,
    },
})

export default styles 