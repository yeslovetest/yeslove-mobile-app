import { ScrollView } from 'react-native';
import sharedStyles from '../ProfileSharedStyles';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import Header from '@/app/Universal-components/Header/Header';
import ProfileHeaderAndBio from './Profile-root-components/Header-and-bio/ProfileHeaderAndBio';
import ProfileNavbar from './Profile-root-components/Profile-navbar/ProfileNavbar';
import TimelineContent from './Profile-root-components/Profile-navbar/Timeline/TimelineContent';
import MediaContent from './Profile-root-components/Profile-navbar/Media/MediaContent';
import Details from './Profile-root-components/Details/Details';
import { useFocusEffect } from '@react-navigation/native';
import { fetchUserDataAction } from '@/app/store/Profile-store/profileSlice';
import React from 'react';

const aboutItems = ["View", "Edit"]

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

 
  return (
    <>
      <Header mainTitle={userName} />
      <ScrollView
        contentContainerStyle={sharedStyles.contentContainer}
        style={sharedStyles.container}
      >
        <ProfileHeaderAndBio />
        {isCurrentUserProfile && 
          <Details />
        }
        
        <ProfileNavbar />

        {activeMainTab === "Timeline" &&
          <TimelineContent />
        }

        {activeMainTab === "Media" &&
          <MediaContent />
        }


      </ScrollView>
    </>
  );
}


