import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import styles from './AboutNavbarStyles';

export interface Props {
  tabItems: string[];
  activeTab: string;
  onChangeTab: (current: string) => void;
}

const AboutNavbar = ({ tabItems, activeTab: externalActiveTab, onChangeTab, defaultTab = "View" }: Props & { defaultTab?: string }) => {
  const [activeTab, setActiveTab] = React.useState(externalActiveTab ?? defaultTab);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onChangeTab(tab);
  };

  return (
    <View style={styles.aboutNavBarContainer}>
      <View style={styles.aboutNavBar}>
        {tabItems.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.aboutItem, activeTab === tab && styles.activeAboutItem]}
            onPress={() => handleTabChange(tab)}
          >
            <Text style={[styles.navText, activeTab === tab && styles.activeAboutNavText]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};


export default AboutNavbar;


