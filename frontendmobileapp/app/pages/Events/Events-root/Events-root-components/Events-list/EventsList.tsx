import { View } from "react-native";
import OneEvent from "../One-event/OneEvent";
import eventPlaceholders from "./placeholderEvents";
import styles from "./EventsListStyles";

const EventsList = () => {

    return (
        <View style={styles.eventsContainer}>
            {eventPlaceholders.map((eventPlaceholder, index) => (
                <OneEvent event={eventPlaceholder} key={index}/>
            ))}
        </View>
    );
}

export default EventsList
