import React, { ReactNode } from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { useAppDispatch, useAppSelector } from "../../../app/store/hooks";
import { changeTabAction, TabData, TabType } from "../../store/Navigation/navigationSlice";
import { fetchUserNotifications } from "@/app/store/Notification-store/notificationSlice";
import styles from "./FooterStyles";
import Ionicons from '@expo/vector-icons/Ionicons';

interface Props {
  tab: TabData;
  title: string;
  icon: string;
  selectedIcon: string;
  clicked?: () => void;
  children?: ReactNode;
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
    if (props.title === 'Notifications') {
      dispatch(fetchUserNotifications({}));
    }
    props.clicked?.();
  };

  return (
    <TouchableOpacity style={styles.iconContainer} onPress={handlePress}>
     <View style={{ position: "relative" }}>
    <Ionicons
      name={isSelected ? props.selectedIcon : props.icon}
      size={24}
      style={[styles.icon, isSelected && styles.activeIcon]}
    />
    {!isSelected && props.children}
  </View>
      <Text style={[styles.footerText, isSelected && styles.activeText]}>{props.title}</Text>
    </TouchableOpacity>
  );
};


export default FooterButton;
