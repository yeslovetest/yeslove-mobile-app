import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
        settingsSubSection: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBlockColor: theme.colors.footerFontColor,
        backgroundColor: theme.colors.mainBkgColor
    },
        changeViewButton: {
        borderColor: theme.colors.primaryBlue,
        borderWidth: 1,
        padding: 10,
        width: "100%",
        margin: 10,
        borderRadius: 10,
    },

    changeViewButtonText: {
        color: "#010101",
        textAlign: "center",
        fontSize: 15
    },

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