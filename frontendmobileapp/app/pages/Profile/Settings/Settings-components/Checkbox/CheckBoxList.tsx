import { View, Text } from "react-native";
import styles from "./CheckBoxStyles";
import CheckBox from "./CheckBox";

interface Item {
  label?: string;
  onPress?: () => void;
}

interface Props {
  header?: string;
  items?: Item[];
  state?: boolean[];
}

const CheckBoxList = (props: Props) => {
  const headerText = props?.header ?? "";
  const itemList = props?.items ?? [];
  const itemStateValues = props?.state ?? [];

  return (
    <View style={{ ...styles.settingsNavItemContent, alignItems: "flex-start" }}>
      <Text style={[styles.headerText, styles.headerText2]}>{headerText}</Text>
      {itemList &&
        itemList.map((checkBox, indx) => (
          <CheckBox
            text={checkBox?.label ?? ""}
            value={itemStateValues?.[indx] ?? false}
            key={checkBox?.label ?? ""}
            btnPress={checkBox?.onPress}
          />
        ))}
    </View>
  );
};

export default CheckBoxList;
