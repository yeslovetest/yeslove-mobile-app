import { ScrollView } from 'react-native';
import IndividualEventHeader from './IndividualEventHeader';
import styles from '../Events-styles/EventsStyles';
import EventInfo from './EventInfo';
import Header from '@/app/Universal-components/Header/Header';

const IndividualEventPage = () => {

  return (
    <>
    <Header></Header>
    <ScrollView contentContainerStyle={styles.contentContainer} style={styles.indEventsContainer}>
      <IndividualEventHeader />
      <EventInfo />
    </ScrollView>
    </>
  )
}

export default IndividualEventPage
