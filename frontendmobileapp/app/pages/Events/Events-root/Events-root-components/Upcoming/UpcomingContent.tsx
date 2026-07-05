import React from "react";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import EventsList from "../Events-list/EventsList";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { fetchAllEvents } from "@/app/store/Events-store/eventsSlice";
import EventPaginator from "../../../../../Universal-components/Paginator/Paginator";

interface Props {
  dates: { startDate?: string; endDate?: string };
}

const UpcomingContent = ({ dates }: Props) => {
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector((state) => state.events.allEvents.eventPage);
  const totalEvents = useAppSelector((state) => state.events.allEvents.totalEvents);
  const eventsPerPage = useAppSelector((state) => state.events.allEvents.eventsPerPage);
  const totalPages = Math.ceil(totalEvents / eventsPerPage); // Calculate total pages

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchAllEvents(dates));
    }, [dates.endDate, dates.startDate]),
  );

  const handlePageChange = (page: number) => {
    dispatch(fetchAllEvents({ ...dates, currentPage: page }));
  };

  return (
    <View style={{ width: "100%" }}>
      <EventsList eventType="upcoming" />
      {totalPages > 0 && (
        <EventPaginator
          currentPage={currentPage ?? 1}
          totalPages={totalPages ?? 1}
          onPageChange={(page) => handlePageChange(page)}
        />
      )}
    </View>
  );
};

export default UpcomingContent;
