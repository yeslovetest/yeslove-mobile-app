
import { View, Text } from 'react-native';
import styles from './EventsInfoDetailsStyles';
import { Event } from '../../../Events-root/Events-root-components/Events-list/placeholderEvents';
import { useAppSelector } from '@/app/store/hooks';
import { EventsModelResponse, EventListResponse } from "@/generated-api";
import dayjs from 'dayjs';


const EventInfoDetails = () => {
    const event: EventsModelResponse = useAppSelector(state => state.navigation.tabStack.at(-1)?.data) as EventsModelResponse;
    return (
        <View>
            <View style={styles.eventInfo}>
                <View style={styles.addressContainer}>
                    <Text style={styles.addressHeader}>Address</Text>
                    <Text style={styles.eventAddress}>{event.location}</Text>
                </View>
                <View style={styles.dateAndTimeContainer}>
                    <View style={styles.dateContainer2}>
                        <Text style={styles.dateHeader}>Date</Text>
                        <Text style={styles.eventDate}>{dayjs(event.event_time).format('MMM D, YYYY')}</Text>
                    </View>
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeHeader}>Time</Text>
                        <Text style={styles.eventTime}>{dayjs(event.event_time).format('h:mm A')}</Text>
                    </View>
                </View>
                <View style={styles.extraInfoContainer}>
                    <Text style={styles.extraInfoHeader}>Extra Information</Text>
                    <Text style={styles.eventExtraInfo}>{event.description}</Text>
                </View>
            </View>

        </View>
    )
}

export default EventInfoDetails
