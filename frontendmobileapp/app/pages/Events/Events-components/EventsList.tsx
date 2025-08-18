import { View } from "react-native";
import OneEvent from "./OneEvent";
import eventPlaceholders from "./placeholderEvents";
import styles from "../Events-styles/EventsStyles";

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
