import { ScrollView, Text } from 'react-native';
import styles from "../../Styles/page-styles/EventsStyles";
import EventNavbar from '@/components/events-components/EventNavbar';
import Header from '../Header';
import OrangeBanner from '@/components/universal-components/OrangeBanner';


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


