import styles from "@/Styles/page-styles/ProfileStyles";
import { useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";

interface Props {
    tabItems?: string[];
    defaultTab?: string;
    onChangeTab?: (current: string) => void;
}

const SectionNavBar = (props: Props) => {
    const tabItems = props?.tabItems ?? [];
    const defaultTab = props?.defaultTab ?? tabItems[0];
    const [activeTab, setActiveTab] = useState(defaultTab ?? '');
    const onChangeTab = props?.onChangeTab ?? (() => {});

    const changeTab = (tab: string) => {
        setActiveTab(tab);
        onChangeTab(tab);
    }

    return (
        <View style={{...styles.aboutNavBar, justifyContent: 'space-evenly'}}>
            {tabItems.map((tab) => (
                <TouchableOpacity key={tab} style={[styles.settingsNavItem, activeTab === tab && styles.activeAboutItem]} 
                onPress={() => changeTab(tab)}>
                <Text style={[styles.navText, activeTab === tab && styles.activeAboutNavText]}>{tab}</Text>
                {activeTab === tab && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
            ))}
        </View>
    )
}

export default SectionNavBar;