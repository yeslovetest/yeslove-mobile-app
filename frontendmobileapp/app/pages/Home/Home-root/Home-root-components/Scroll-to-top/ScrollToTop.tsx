
import { TouchableOpacity, View } from "react-native";
import styles from "./ScrollToTopStyles";
import { useAppDispatch } from "@/app/store/hooks";
import { triggerScrollToTopAction } from "@/app/store/Home-store/feedSlice";
import Entypo from '@expo/vector-icons/Entypo';

const ScrollToTop = () => {
  const dispatch = useAppDispatch();

  const goToUp = () => {
    dispatch(triggerScrollToTopAction(1));
  }

  return (
    <View style={styles.button}>
      <TouchableOpacity
        onPress={goToUp}
        pressRetentionOffset={10}
        hitSlop={10}
        activeOpacity={0.3} 
      >
        <Entypo name="arrow-with-circle-up" size={28} style={styles.upIcon} />
      </TouchableOpacity>
    </View>
  )
}

export default ScrollToTop;
