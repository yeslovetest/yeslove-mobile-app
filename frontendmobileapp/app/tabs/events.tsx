import { ScrollView, Text } from 'react-native';
import styles from "../../Styles/page-styles/EventsStyles";
import EventNavbar from '@/components/events-components/EventNavbar';


export default function EventsPage() {
  return (
    <ScrollView  contentContainerStyle={styles.contentContainer} style={styles.container}>
     <Text style={styles.title}>Events</Text>
     <EventNavbar />
    </ScrollView>
  );
}


