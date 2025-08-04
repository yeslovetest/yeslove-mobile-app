import { TouchableOpacity, View, Text } from "react-native";
import styles from "@/Styles/component-styles/ScrollToTopStyles";
import { useAppDispatch } from "@/app/store/hooks";
import { triggerScrollToTopAction } from "@/app/store/feedSlice";



const ScrollToTop = () => {

    const dispatch = useAppDispatch();

    const goToUp = () => {
        dispatch(triggerScrollToTopAction(1));
    }

    return (
        <View style={styles.button}>
            <TouchableOpacity onPress={goToUp} pressRetentionOffset={10} hitSlop={10}>
                <Text style={styles.buttonIcon}>⬆</Text>
            </TouchableOpacity>
        </View>
    )
}

export default ScrollToTop;