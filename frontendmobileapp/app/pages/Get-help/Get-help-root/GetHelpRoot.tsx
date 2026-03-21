import { ScrollView } from 'react-native';
import sharedStyles from '../GetHelpSharedStyles';
import GetHelpNavbar from './Get-help-root-components/Get-help-navbar/GetHelpNavbar';
import Header from '@/app/Universal-components/Header/Header';
import OrangeBanner from '@/app/Universal-components/Orange-banner/OrangeBanner';
import { useAppSelector } from '@/app/store/hooks';
import ProfessionalsContent from './Get-help-root-components/Professionals/ProfessionalsContent';
import BlogsContent from './Get-help-root-components/Blogs/BlogsContent';

export default function GetHelpRoot() {
  let activeTab = useAppSelector(state => state.getHelp.view.activeTab);
  return (
    <>
      <Header mainTitle="Yeslove!"></Header>
      <ScrollView
        contentContainerStyle={sharedStyles.contentContainer}
        style={sharedStyles.container}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
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

