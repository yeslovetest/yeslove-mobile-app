import { ScrollView } from 'react-native';
import EventsInfoHeader from './Events-info-components/EventsPageHeader.tsx/EventsInfoHeader';
import sharedStyles from '../EventsSharedStyles';
import styles from './EventsInfoPageStyles';
import EventsInfoDetails from './Events-info-components/Events-info-details/EventInfoDetails';
import Header from '@/app/Universal-components/Header/Header';

const EventInfoPage = () => {

  return (
    <>
    <Header></Header>
    <ScrollView contentContainerStyle={sharedStyles.contentContainer} style={styles.indEventsContainer}>
      <EventsInfoHeader />
      <EventsInfoDetails />
    </ScrollView>
    </>
  )
}

export default EventInfoPage
