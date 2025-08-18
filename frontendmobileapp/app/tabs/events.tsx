import { ScrollView, Text } from 'react-native';
import styles from '../pages/Events/Events-styles/EventsStyles';
import EventNavbar from '../pages/Events/Events-components/EventNavbar';
import Header from '../Universal-components/Header/Header';
import OrangeBanner from '@/app/Universal-components/Orange-banner/OrangeBanner';


export default function EventsPage() {
  return (
    <>
      <Header mainTitle='Yeslove!'></Header>
      <ScrollView contentContainerStyle={styles.contentContainer} style={styles.container}>
        <OrangeBanner icon="icons" description="Browse our past and future events" mainTitle="Our Events" />
        <EventNavbar />
      </ScrollView>
    </>
  );
}


