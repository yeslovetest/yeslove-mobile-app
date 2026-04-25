import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from 'react-native';
import sharedStyles from '../ProfileSharedStyles';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import Header from '@/app/Universal-components/Header/Header';
import ProfileHeaderAndBio from './Profile-root-components/Header-and-bio/ProfileHeaderAndBio';
import ProfileNavbar from './Profile-root-components/Profile-navbar/ProfileNavbar';
import TimelineContent from './Profile-root-components/Profile-navbar/Timeline/TimelineContent';
import MediaContent from './Profile-root-components/Profile-navbar/Media/MediaContent';
import Details from './Profile-root-components/Details/Details';
import { useFocusEffect } from '@react-navigation/native';
import { fetchUserDataAction, fetchUserTimelineNextPageAction } from '@/app/store/Profile-store/profileSlice';
import React, { useEffect, useRef } from 'react';

export default function ProfileRoot() {

  const dispatch = useAppDispatch()
  const userId = useAppSelector(
    (state) => state.navigation.tabStack.at(-1)?.data?.userId  //keycloak Id
  );
  const currentUserId = useAppSelector(state => state.user.id);
  const tabStack = useAppSelector((state) => state.navigation.tabStack);
  // check if the profile to be fetched belongs to the Current User
  const isCurrentUserProfile = (currentUserId === userId);
  useFocusEffect(React.useCallback(() => {
    dispatch(fetchUserDataAction({id: tabStack.at(-1)?.data?.userId, isCurrentUser: isCurrentUserProfile}));
  }, [tabStack]));

  const userName = useAppSelector(
    (state) => state.profile.profiles[userId]?.username ?? ""
  );
 
  const activeMainTab = useAppSelector(
    (state) => state.profile.view.activeTab
  );
  const timeline = useAppSelector((state) => state.profile.timeline);
  const requestingNextPageRef = useRef(false);

  useEffect(() => {
    if (!timeline.fetchingMore) {
      requestingNextPageRef.current = false;
    }
  }, [timeline.fetchingMore]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (activeMainTab !== 'Timeline' || !userId) {
      return;
    }

    if (timeline.loading || timeline.fetchingMore || !timeline.hasMore || requestingNextPageRef.current) {
      return;
    }

    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);
    if (distanceFromBottom <= 220) {
      requestingNextPageRef.current = true;
      dispatch(fetchUserTimelineNextPageAction({ id: userId, perPage: timeline.perPage || 10 }));
    }
  };

 
  return (
    <>
      <Header mainTitle={userName} />
      <ScrollView
        contentContainerStyle={sharedStyles.contentContainer}
        style={sharedStyles.container}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={sharedStyles.heroSection}>
          <ProfileHeaderAndBio />
        </View>

        {isCurrentUserProfile && (
          <View style={sharedStyles.detailsSection}>
            <Details />
          </View>
        )}

        <View style={sharedStyles.tabSection}>
          <ProfileNavbar />
        </View>

        <View style={sharedStyles.contentSection}>
          {activeMainTab === "Timeline" &&
            <TimelineContent />
          }

          {activeMainTab === "Media" &&
            <MediaContent />
          }
        </View>


      </ScrollView>
    </>
  );
}


