import React from "react";
import { Text } from "react-native";

/**
 * Lightweight stand-in for @expo/vector-icons. The real library pulls in
 * expo-font's native FontLoader, which cannot resolve under Jest. Each icon
 * renders a <Text> and forwards props (name, onPress, accessibility*), so tests
 * can still query and press icons.
 */
const Icon = (props: any) => React.createElement(Text, props, props?.name ?? "icon");

export default Icon;
export const Ionicons = Icon;
export const FontAwesome = Icon;
export const FontAwesome5 = Icon;
export const FontAwesome6 = Icon;
export const Entypo = Icon;
export const Feather = Icon;
export const AntDesign = Icon;
export const MaterialIcons = Icon;
export const MaterialCommunityIcons = Icon;
