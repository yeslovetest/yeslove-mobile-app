import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useAppDispatch, useAppSelector } from "../../../app/store/hooks";
import { changeTabAction, TabData, TabType } from "../../store/Navigation/navigationSlice";
import styles from "./FooterStyles";
import Ionicons from '@expo/vector-icons/Ionicons';

interface Props {
  tab: TabData;
  title: string;
  icon: string;
  selectedIcon: string;
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
    <TouchableOpacity style={styles.iconContainer} onPress={handlePress}>
      <Ionicons
        name={isSelected ? props.selectedIcon : props.icon}
        size={24}
        style={[styles.icon, isSelected && styles.activeIcon]}
      />
      <Text style={[styles.footerText, isSelected && styles.activeText]}>{props.title}</Text>
    </TouchableOpacity>
  );
};


export default FooterButton;
