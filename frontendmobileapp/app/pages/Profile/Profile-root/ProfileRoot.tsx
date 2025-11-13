import { ScrollView } from 'react-native';
import sharedStyles from '../ProfileSharedStyles';
import { useAppSelector } from '@/app/store/hooks';
import Header from '@/app/Universal-components/Header/Header';
import ProfileHeaderAndBio from './Profile-root-components/Header-and-bio/ProfileHeaderAndBio';
import ProfileNavbar from './Profile-root-components/Profile-navbar/ProfileNavbar';
import { useState } from 'react';
import TimelineContent from './Profile-root-components/Profile-navbar/Timeline/TimelineContent';
import MediaContent from './Profile-root-components/Profile-navbar/Media/MediaContent';
import Details from './Profile-root-components/Details/Details';

const aboutItems = ["View", "Edit"]

export default function ProfileRoot() {
  const userId = useAppSelector(
    (state) => state.navigation.tabStack.at(-1)?.data?.userId
  );
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
        <Details />

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


