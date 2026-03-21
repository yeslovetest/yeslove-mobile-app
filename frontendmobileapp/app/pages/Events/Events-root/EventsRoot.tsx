import { ScrollView } from 'react-native';
import styles from '../EventsSharedStyles';
import EventNavbar from './Events-root-components/Events-navbar/EventNavbar';
import Header from '../../../Universal-components/Header/Header';
import OrangeBanner from '@/app/Universal-components/Orange-banner/OrangeBanner';
import { useAppSelector } from '@/app/store/hooks';
import EventsList from './Events-root-components/Events-list/EventsList';
import UpcomingContent from './Events-root-components/Upcoming/UpcomingContent';
import AttendingContent from './Events-root-components/Attending/AttendingContent';
import AttendedContent from './Events-root-components/Attended/AttendedContent';


export default function EventsPage() {
      let activeTab = useAppSelector(state => state.events.view.activeTab);
  return (
    <>
      <Header mainTitle='Yeslove!'></Header>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <OrangeBanner icon="icons" description="Browse our past and future events" mainTitle="Our Events" />
        <EventNavbar />
              {activeTab === "Upcoming" && (
                  <UpcomingContent />
              )}
        
              {activeTab === "Attending" && (
                <AttendingContent />
              )}
        
              {activeTab === "Attended" && (
              <AttendedContent />)}
      </ScrollView>
    </>
  );
};


