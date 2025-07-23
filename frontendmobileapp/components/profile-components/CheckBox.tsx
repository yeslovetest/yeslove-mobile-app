import { TouchableOpacity, View, Text } from "react-native";
import styles from "@/Styles/component-styles/CheckBoxStyles";
import { useState } from "react";

interface Props {
    text?: string;
    value?: boolean;
 }

const CheckBox = (props: Props) => {
    const text = props?.text ?? '';
    const value = props?.value ?? true;
    const [boxValue, setBoxValue] = useState(value)

    return (
        <View style={styles.container}>
            <Text style={styles.mainText}>{text}</Text>
            <TouchableOpacity style={styles.outerBox} onPress={() => setBoxValue((prev) => !prev)}>
                <View style={{...styles.innerBox, backgroundColor: boxValue? 'black' : 'white'}}></View>
            </TouchableOpacity>
        </View>
    )
}

export default CheckBox;