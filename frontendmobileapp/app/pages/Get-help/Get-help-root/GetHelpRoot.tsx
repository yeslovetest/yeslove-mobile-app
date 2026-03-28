import React, { useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';
import sharedStyles from '../GetHelpSharedStyles';
import GetHelpNavbar from './Get-help-root-components/Get-help-navbar/GetHelpNavbar';
import Header from '@/app/Universal-components/Header/Header';
import OrangeBanner from '@/app/Universal-components/Orange-banner/OrangeBanner';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import ProfessionalsContent from './Get-help-root-components/Professionals/ProfessionalsContent';
import BlogsContent from './Get-help-root-components/Blogs/BlogsContent';
import { setGetHelpScrollViewPosition } from '@/app/store/Get-help-store/getHelpSlice';
import { useFocusEffect } from 'expo-router';

export default function GetHelpRoot() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(state => state.getHelp.view.activeTab);
  const scrollViewPosition = useAppSelector(state => state.getHelp.scrollViewPosition);
  const scrollViewRef = useRef<ScrollView>(null);

  useFocusEffect(
    React.useCallback(() => {
      let restoreTimer: ReturnType<typeof setTimeout> | undefined;
      if (scrollViewRef.current && scrollViewPosition > 0) {
        restoreTimer = setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: scrollViewPosition, animated: false });
        }, 10);
      }

      return () => {
        if (restoreTimer) {
          clearTimeout(restoreTimer);
        }
      };
    }, [])
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    dispatch(setGetHelpScrollViewPosition(event.nativeEvent.contentOffset.y));
  };

  return (
    <>
      <Header mainTitle="Yeslove!"></Header>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={sharedStyles.contentContainer}
        style={sharedStyles.container}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {activeTab === "Professionals" && (
          <OrangeBanner icon="users" mainTitle="Our Professionals" description="Browse the list of professionals" />
        )}
        {activeTab === "Blogs" && (
          <OrangeBanner icon="book-open-reader" mainTitle="Our Blogs" description="Browse the list of blogs" />
        )}
        <GetHelpNavbar />
        {activeTab === "Professionals" && (
          <ProfessionalsContent />
        )}

        {activeTab === "Blogs" && (
          <BlogsContent />
        )}
      </ScrollView>
    </>
  );
}

