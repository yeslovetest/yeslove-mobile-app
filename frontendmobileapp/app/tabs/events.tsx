import { View, Text } from 'react-native';
import styles from "../../Styles/page-styles/EventsStyles";
import EventNavbar from '@/components/events-components/EventNavbar';
import Event from '@/components/events-components/EventsList';


export default function EventsPage() {
  return (
    <View style={styles.container}>
     <Text style={styles.title}>Events</Text>
     <EventNavbar />
    </View>
  );
}


