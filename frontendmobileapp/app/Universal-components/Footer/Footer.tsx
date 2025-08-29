import React from 'react';
import { View } from 'react-native';
import FooterButton from './FooterButton';
import { TabType } from '../../store/Navigation/navigationSlice';
import styles from "./FooterStyles"
import { useAppSelector } from '../../store/hooks';


const Footer = () => {
  const userId = useAppSelector(state => state.user.id);
  const hasTabToGoBackTo = useAppSelector(state => state.navigation.tabStack.length > 1);

  if (hasTabToGoBackTo) {
    return null;
  }




  return (
    <View style={styles.footer}>
      <FooterButton tab={{ type: TabType.HOME }}
        icon="home-outline"
        selectedIcon="home"
        title="Home"></FooterButton>
      <FooterButton tab={{ type: TabType.GET_HELP }} icon='bulb-outline' selectedIcon="bulb" title='Get help'>
      </FooterButton>
      <FooterButton tab={{ type: TabType.NOTIFICATIONS }} icon="notifications-outline"
        selectedIcon="notifications" title='Notifications'>
        <View style={styles.newNotification}></View>
      </FooterButton>
      <FooterButton tab={{ type: TabType.EVENTS }} icon='calendar-outline' selectedIcon="calendar" title='Events'></FooterButton>
      <FooterButton tab={{ type: TabType.PROFILE, data: { userId: userId } }} icon='person-outline' selectedIcon='person' title='Profile'>
      </FooterButton>
    </View>
  );
}


export default Footer