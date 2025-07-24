import { ScrollView } from 'react-native';
import IndividualEventHeader from './IndividualEventHeader';
import styles from '@/Styles/page-styles/EventsStyles';
import EventInfo from './EventInfo';

const IndividualEvent = () => {

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} style={styles.indEventsContainer}>
      <IndividualEventHeader />
      <EventInfo />
    </ScrollView>
  )
}

export default IndividualEvent
