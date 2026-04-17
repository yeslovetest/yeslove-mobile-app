import theme from "@/assets/variables/Variables";
import { vw } from "@/ts/viewport-units";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: "100%",
        alignItems: 'center',
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingRight: 15,
        paddingLeft: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    activeIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primaryBlue,
        position: "absolute",
        left: 10,
    },
    activeBackgroundColor: {
        backgroundColor: "#fff"
    },
    profileImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    username: {
        fontWeight: '600',
        fontSize: 14,
        color: '#222',
    },
    usernameUnopened: {
        fontSize: 15,
        fontWeight: 600,
        color: theme.colors.primaryBlue
    },
    messageText: {
        fontSize: 14,
        color: '#333',
    },
    timeText: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    postImage: {
        width: 48,
        height: 48,
        borderRadius: 6,
        marginLeft: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalCard: {
        width: '92%',
        maxWidth: 380,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111',
        marginBottom: 8,
    },
    modalBody: {
        fontSize: 14,
        color: '#3E4655',
        marginBottom: 14,
    },
    followModalImage: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignSelf: 'center',
        marginBottom: 12,
    },
    followModalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    followModalCloseButton: {
        backgroundColor: theme.colors.primaryBlue,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 10,
    },
    followModalCloseButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    declineButton: {
        borderWidth: 1,
        borderColor: '#D7DBE3',
        backgroundColor: '#F5F6F8',
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 10,
    },
    declineButtonText: {
        color: '#516073',
        fontSize: 13,
        fontWeight: '600',
    },
    acceptButton: {
        backgroundColor: theme.colors.primaryBlue,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 10,
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
})

export default styles