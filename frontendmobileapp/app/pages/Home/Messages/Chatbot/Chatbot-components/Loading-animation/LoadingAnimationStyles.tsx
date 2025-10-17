import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
       loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 15,
        justifyContent: 'flex-start',
        backgroundColor: "#fefefe",
    },

    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 40,
        marginLeft: 40,
        width: "100%",
    },
    dot: {
        height: 8,
        width: 8,
        marginRight: 8,
        borderRadius: 10,
        backgroundColor: '#b8e0fc',
    },
})

export default styles 