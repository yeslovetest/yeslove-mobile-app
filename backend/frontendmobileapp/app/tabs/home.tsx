import React from 'react';
import { ScrollView } from 'react-native';
import UserPostBox from '@/components/home-components/UserPostBox';
import FeedHeader from "@/components/home-components/FeedHeader";
import styles from "../../Styles/page-styles/HomeStyles"
import HomeNavBar from '@/components/home-components/HomeNavBar';



export default function HomeScreen() {

  return (
    <ScrollView  contentContainerStyle={styles.contentContainer} style={styles.container}>
      <FeedHeader />
      <UserPostBox />
      <HomeNavBar />
    </ScrollView>
  );
}

