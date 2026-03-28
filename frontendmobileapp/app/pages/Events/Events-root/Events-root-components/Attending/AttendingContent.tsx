import React from 'react'
import { View } from 'react-native'
import { useFocusEffect } from 'expo-router';
import EventsList from '../Events-list/EventsList'; 
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchUserEvents } from '@/app/store/Events-store/eventsSlice';
import EventPaginator from '../../../../../Universal-components/Paginator/Paginator';

interface Props {
    dates: { startDate?: string; endDate?: string };
}

const AttendingContent = ({ dates }: Props) => {

    const dispatch = useAppDispatch();
    const currentPage = useAppSelector(state => state.events.userEvents.eventPage);
    const totalEvents = useAppSelector(state => state.events.userEvents.totalEvents);
    const eventsPerPage = useAppSelector(state => state.events.userEvents.eventsPerPage);
    const totalPages = Math.ceil(totalEvents / eventsPerPage); // Calculate total pages

    useFocusEffect(React.useCallback(() => {
        dispatch(fetchUserEvents({...dates, queryType: 'attending'}));
    }, [dates.endDate, dates.startDate]));

    const handlePageChange = (page: number) => {
        dispatch(fetchUserEvents({...dates, queryType: 'attending', currentPage: page }));
    }

    return (
        <View style={{ width: '100%' }}>
            <EventsList eventType='attending'/>
            {totalPages > 0 && (
                <EventPaginator currentPage={currentPage ?? 1} totalPages={totalPages ?? 1} 
                    onPageChange={(page) => handlePageChange(page)} 
                />
            )}
        </View>
    )
}

export default AttendingContent
