import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useAppDispatch, useAppSelector } from "../../../app/store/hooks";
import { changeTabAction, TabData, TabType } from "../../store/Navigation/navigationSlice";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import styles from "./FooterStyles";

interface Props {
  tab: TabData;
  title: string;
  icon: string;
  clicked?: () => void;
  selectionCondition?: () => boolean;
}

const FooterButton = (props: Props) => {
  const dispatch = useAppDispatch();
  const currentActiveTab = useAppSelector(
    (state) => state.navigation.tabStack.at(0)
  );
  const isSelected = currentActiveTab?.type == props.tab.type;

  const handlePress = () => {
    dispatch(changeTabAction(props.tab));
    props.clicked?.();
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <FontAwesome6 style={[styles.icon, isSelected && styles.activeIcon]} name={props.icon}></FontAwesome6>
      <Text>{props.title}</Text>
    </TouchableOpacity>
  );
};


export default FooterButton;
