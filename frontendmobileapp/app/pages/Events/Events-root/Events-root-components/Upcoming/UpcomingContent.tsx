import React, { useState } from 'react'
import { View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import EventsList from '../Events-list/EventsList';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchAllEvents } from '@/app/store/Events-store/eventsSlice';
import DateFilterDropdown from '../DateFilter/DateFilter';
import EventPaginator from '../../../../../Universal-components/Paginator/Paginator';

const UpcomingContent = () => {
    const dispatch = useAppDispatch();
    const [dates, setDates] = useState<{ startDate?: string; endDate?: string }>({});
    const currentPage = useAppSelector(state => state.events.allEvents.eventPage);
    const totalEvents = useAppSelector(state => state.events.allEvents.totalEvents);
    const eventsPerPage = useAppSelector(state => state.events.allEvents.eventsPerPage);
    const totalPages = Math.ceil(totalEvents / eventsPerPage); // Calculate total pages

    useFocusEffect(React.useCallback(() => {
            dispatch(fetchAllEvents({}));
    }, []));

    const handleSearch = (dates: { startDate?: string; endDate?: string }) => {
        dispatch(fetchAllEvents(dates));
        setDates(dates); // store date to be used by paginator
    };

    
    const handlePageChange = (page: number) => {
        dispatch(fetchAllEvents({...dates, currentPage: page }));
    }   

    return (
        <View style={{ width: '100%' }}>
            <DateFilterDropdown onSearch={handleSearch} />
            <EventsList eventType='upcoming'/>
            {totalPages > 0 && (
                <EventPaginator currentPage={currentPage ?? 1} totalPages={totalPages ?? 1} 
                    onPageChange={(page) => handlePageChange(page)} 
                />
            )}
        </View>
    )
}

export default UpcomingContent
