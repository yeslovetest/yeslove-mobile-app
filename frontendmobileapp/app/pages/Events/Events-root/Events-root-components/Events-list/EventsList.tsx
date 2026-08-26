import React from "react";
import { View } from "react-native";
import OneEvent from "../One-event/OneEvent";
import styles from "./EventsListStyles";
import { useAppSelector } from "@/app/store/hooks";
import ListStateView from "@/app/Universal-components/List-state/ListStateView";
import { useSettleAfter } from "@/app/Universal-components/List-state/useSettleAfter";

export interface Props {
  eventType?: "upcoming" | "attending" | "attended";
}

const EMPTY_TEXT: Record<NonNullable<Props["eventType"]>, string> = {
  upcoming: "No upcoming events right now.",
  attending: "You are not attending any events yet.",
  attended: "You have not attended any events yet.",
};

const EventsList = (props: Props) => {
  const allEvents = useAppSelector((state) => state.events.allEvents.events ?? []);
  const userEvents = useAppSelector((state) => state.events.userEvents.events ?? []);
  const events = props.eventType === "upcoming" ? allEvents : userEvents;
  const settled = useSettleAfter();

  return (
    <View style={styles.eventsContainer}>
      {events.map((event, index) => (
        <OneEvent event={event} key={index} />
      ))}
      {events.length === 0 && (
        <ListStateView
          loading={!settled}
          loadingText="Loading events..."
          emptyText={EMPTY_TEXT[props.eventType ?? "upcoming"]}
        />
      )}
    </View>
  );
};

export default EventsList;
