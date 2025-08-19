
import { View, Text } from 'react-native';
import styles from '../Events-styles/EventsStyles';
import { Event } from './placeholderEvents';
import { useAppSelector } from '@/app/store/hooks';


const EventInfo = () => {
    const event: Event = useAppSelector(state => state.navigation.tabStack.at(-1)?.data) as Event;
    return (
        <View>
            <View style={styles.eventInfo}>
                <View style={styles.addressContainer}>
                    <Text style={styles.addressHeader}>Address</Text>
                    <Text style={styles.eventAddress}>{event.address}</Text>
                </View>
                <View style={styles.dateAndTimeContainer}>
                    <View style={styles.dateContainer2}>
                        <Text style={styles.dateHeader}>Date</Text>
                        <Text style={styles.eventDate}>{event.dateLong}</Text>
                    </View>
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeHeader}>Time</Text>
                        <Text style={styles.eventTime}>{event.time}</Text>
                    </View>
                </View>
                <View style={styles.extraInfoContainer}>
                    <Text style={styles.extraInfoHeader}>Extra Information</Text>
                    <Text style={styles.eventExtraInfo}>{event.extraInformation}</Text>
                </View>
            </View>

        </View>
    )
}

export default EventInfo
