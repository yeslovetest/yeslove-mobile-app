import React, { useState } from 'react'
import { View } from 'react-native'
import { useFocusEffect } from 'expo-router';
import EventsList from '../Events-list/EventsList'; 
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchUserEvents } from '@/app/store/Events-store/eventsSlice';
import DateFilterDropdown from '../DateFilter/DateFilter';
import EventPaginator from '../../../../../Universal-components/Paginator/Paginator';

const AttendingContent = () => {

    const dispatch = useAppDispatch();
    const [dates, setDates] = useState<{ startDate?: string; endDate?: string }>({});
    const currentPage = useAppSelector(state => state.events.allEvents.eventPage);
    const totalEvents = useAppSelector(state => state.events.allEvents.totalEvents);
    const eventsPerPage = useAppSelector(state => state.events.allEvents.eventsPerPage);
    const totalPages = Math.ceil(totalEvents / eventsPerPage); // Calculate total pages

    useFocusEffect(React.useCallback(() => {
        dispatch(fetchUserEvents({queryType: 'attending'}));
    }, []));

    const handleSearch = (dates: { startDate?: string; endDate?: string }) => {
        dispatch(fetchUserEvents({...dates, queryType: 'attending'}));
        setDates(dates); // store date to be used by paginator
    };

    const handlePageChange = (page: number) => {
        dispatch(fetchUserEvents({...dates, queryType: 'attending', currentPage: page }));
    }

    return (
        <View>
            <DateFilterDropdown onSearch={handleSearch} />
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
