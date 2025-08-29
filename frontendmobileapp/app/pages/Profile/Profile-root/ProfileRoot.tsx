import { ScrollView, Text, View } from 'react-native';
import sharedStyles from '../ProfileSharedStyles';
import { useAppSelector } from '@/app/store/hooks';
import Header from '@/app/Universal-components/Header/Header';
import ProfileHeaderAndBio from './Profile-root-components/Header-and-bio/ProfileHeaderAndBio';
import ProfileNavbar from './Profile-root-components/Profile-navbar/ProfileNavbar';
import { useState } from 'react';
import AboutNavbar from './Profile-root-components/Profile-navbar/About/About-navbar/AboutNavbar';
import ViewContent from './Profile-root-components/Profile-navbar/About/About-navbar/View/ViewContent';
import EditContent from './Profile-root-components/Profile-navbar/About/About-navbar/Edit/EditContent';
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

  const [activeAboutTab, setActiveAboutTab] = useState("View");


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
        {activeMainTab === "About" && (
          <View>
            <AboutNavbar
              tabItems={aboutItems}
              activeTab={activeAboutTab}
              onChangeTab={setActiveAboutTab}
            />

            {activeAboutTab === "View" && <ViewContent />}
            {activeAboutTab === "Edit" && <EditContent />}
          </View>
        )}

        {activeMainTab === "Media" &&
          <MediaContent />
        }
        {activeMainTab === "Invitations" &&
          <Text>Not sure what this is for</Text>
        }


      </ScrollView>
    </>
  );
}


