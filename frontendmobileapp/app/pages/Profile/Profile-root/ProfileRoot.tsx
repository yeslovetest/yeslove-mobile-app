import { ScrollView, Text, View } from 'react-native';
import sharedStyles from '../ProfileSharedStyles';
import { useAppSelector } from '@/app/store/hooks';
import Header from '@/app/Universal-components/Header/Header';
import ProfileHeaderAndBio from './Profile-root-components/Header-and-bio/ProfileHeaderAndBio';
import ProfileNavbar from './Profile-root-components/Profile-navbar/ProfileNavbar';
import { useState } from 'react';
import GeneralContent from './Profile-root-components/Profile-navbar/Settings/Settings-navbar/General/GeneralContent';
import SettingsNavbar from './Profile-root-components/Profile-navbar/Settings/Settings-navbar/SettingsNavbar';
import EmailContent from './Profile-root-components/Profile-navbar/Settings/Settings-navbar/Email/EmailNtfnSetting';
import ProfileVisibilityContent from './Profile-root-components/Profile-navbar/Settings/Settings-navbar/Profile-visibility/ProfileVisibilitySettings';
import ExportDataContent from './Profile-root-components/Profile-navbar/Settings/Settings-navbar/Export-data/ExportDataContent';
import AboutNavbar from './Profile-root-components/Profile-navbar/About/About-navbar/AboutNavbar';
import ViewContent from './Profile-root-components/Profile-navbar/About/About-navbar/View/ViewContent';
import EditContent from './Profile-root-components/Profile-navbar/About/About-navbar/Edit/EditContent';
import TimelineContent from './Profile-root-components/Profile-navbar/Timeline/TimelineContent';
import VideosContent from './Profile-root-components/Profile-navbar/Videos/VideosContent';

const settingsItems = ["General", "Email", "Profile Visibility", "Export Data"];
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

  const [activeSettingsTab, setActiveSettingsTab] = useState("General");

  return (
    <>
      <Header mainTitle={userName} />
      <ScrollView
        contentContainerStyle={sharedStyles.contentContainer}
        style={sharedStyles.container}
      >
        <ProfileHeaderAndBio />

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

        {activeMainTab === "Videos" &&
          <VideosContent />
        }
        {activeMainTab === "Notifications" &&
          <Text>This is getting moved</Text>
        }
        {activeMainTab === "Photos" &&
          <Text>This is getting combined with videos</Text>
        }




        {activeMainTab === "Settings" && (
          <>
            <SettingsNavbar
              tabItems={settingsItems}
              defaultTab={activeSettingsTab}
              onChangeTab={setActiveSettingsTab}
            />

            {activeSettingsTab === "General" && <GeneralContent />}
            {activeSettingsTab === "Email" && <EmailContent />}
            {activeSettingsTab === "Profile Visibility" && <ProfileVisibilityContent />}
            {activeSettingsTab === "Export Data" && <ExportDataContent />}
          </>
        )}


        {activeMainTab === "Messages" && <Text>This is also getting moved</Text>
        }
        {activeMainTab === "Invitations" &&
          <Text>Not sure what this is for</Text>
        }


      </ScrollView>
    </>
  );
}


