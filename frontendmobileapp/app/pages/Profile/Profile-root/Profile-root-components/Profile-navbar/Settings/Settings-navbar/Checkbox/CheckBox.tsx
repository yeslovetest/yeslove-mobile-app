import { TouchableOpacity, View, Text } from "react-native";
import styles from "./CheckBoxStyles";
import { useState } from "react";

interface Props {
    text?: string;
    value?: boolean;
    key?: number | string;
    btnPress?: () => void;
    
 }

const CheckBox = (props: Props) => {
    const text = props?.text ?? '';
    const value = props?.value ?? true;
    const key = props?.key ?? undefined;
    const btnPress = props?.btnPress ?? (() => {});
    const [boxValue, setBoxValue] = useState(value)

    const handleChange = () => {
        setBoxValue((prev) => !prev);
        btnPress();
    }

    return (
        <View style={styles.container} key={key}>
            <Text style={styles.mainText}>{text}</Text>
            <TouchableOpacity style={styles.outerBox} onPress={handleChange}>
                <View style={{...styles.innerBox, backgroundColor: boxValue? 'black' : 'white'}}></View>
            </TouchableOpacity>
        </View>
    )
}

export default CheckBox;