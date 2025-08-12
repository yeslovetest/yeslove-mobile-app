
import React, { useRef } from 'react'
import { ScrollView } from 'react-native'
import Header from '../Header'
import { useAppSelector } from '../store/hooks'
import { useFocusEffect } from 'expo-router'
import styles from '@/Styles/page-styles/NotificationsStyles'

const NotificationsPage = () => {
 const userId = useAppSelector((state) => state.navigation.tabStack.at(-1)?.data?.userId);
 const userName = useAppSelector((state) => state.profile.profiles[userId]?.username ?? "");
 const scrollViewRef = useRef<ScrollView>(null);
 const scrollViewPosition = useAppSelector(state => state.feed.scrollViewPosition);

useFocusEffect(
  React.useCallback(() => {
    if (scrollViewRef.current && scrollViewPosition > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: scrollViewPosition, animated: false });
      }, 10);
    }
  }, [])
);


  return (
    <>
    <Header mainTitle={userName}></Header>
    <ScrollView ref={scrollViewRef} contentContainerStyle={styles.contentContainer} style={styles.container}></ScrollView>
      
    </>
  )
}

export default NotificationsPage
