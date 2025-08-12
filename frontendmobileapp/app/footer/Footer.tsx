import React from 'react';
import { View } from 'react-native';
import FooterButton from '../../components/footer-components/FooterButton';
import { TabType } from '../store/navigationSlice';
import styles from "../../Styles/component-styles/FooterStyles"
import { useAppSelector } from '../store/hooks';


const Footer = () => {
  const userId = useAppSelector(state => state.user.id);

  
  
  return (
    <View style={styles.footer}>
      <FooterButton tab={{ type: TabType.HOME }} icon='house' title='Home'></FooterButton>
      <FooterButton tab={{ type: TabType.GET_HELP }} icon='hand-holding-heart' title='Get help'></FooterButton>
      <FooterButton tab={{ type: TabType.NOTIFICATIONS, data: { userId: userId} }} icon='at' title='Notifications'>
      </FooterButton>
      <FooterButton tab={{ type: TabType.EVENTS }} icon='martini-glass-citrus' title='Events'></FooterButton>
      <FooterButton tab={{ type: TabType.PROFILE, data: { userId: userId} }} icon='circle-user' title='Profile'>
      </FooterButton>
    </View>
  );
}


export default Footer