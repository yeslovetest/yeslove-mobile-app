import { ScrollView, Text } from 'react-native';
import styles from "../../Styles/page-styles/EventsStyles";
import EventNavbar from '@/components/events-components/EventNavbar';
import OrangeBanner from '@/components/universal-components/OrangeBanner';


export default function EventsPage() {
  return (
    <ScrollView  contentContainerStyle={styles.contentContainer} style={styles.container}>
     <EventNavbar />
    </ScrollView>
  );
}


