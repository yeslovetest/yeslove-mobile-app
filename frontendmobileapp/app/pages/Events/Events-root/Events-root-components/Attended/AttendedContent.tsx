import React, { useState } from 'react'
import { View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchUserEvents } from '@/app/store/Events-store/eventsSlice';
import EventsList from '../Events-list/EventsList';
import DateFilterDropdown from '../DateFilter/DateFilter';
import EventPaginator from '../../../../../Universal-components/Paginator/Paginator';

const AttendedContent = () => {

    const dispatch = useAppDispatch();
    const [dates, setDates] = useState<{ startDate?: string; endDate?: string }>({});
    const currentPage = useAppSelector(state => state.events.userEvents.eventPage);
    const totalEvents = useAppSelector(state => state.events.userEvents.totalEvents);
    const eventsPerPage = useAppSelector(state => state.events.userEvents.eventsPerPage);
    const totalPages = Math.ceil(totalEvents / eventsPerPage); // Calculate total pages
    
    useFocusEffect(React.useCallback(() => {
        dispatch(fetchUserEvents({queryType: 'attended'}));
    }, []));

    const handleSearch = (dates: { startDate?: string; endDate?: string }) => { 
        dispatch(fetchUserEvents({...dates, queryType: 'attended'}));
        setDates(dates); // store date to be used by paginator
    };

    const handlePageChange = (page: number) => {
        dispatch(fetchUserEvents({...dates, queryType: 'attended', currentPage: page }));
    }

    return (
        <View style={{ width: '100%' }}>
            <DateFilterDropdown onSearch={handleSearch} />
            <EventsList eventType='attended'/>
                {totalPages > 0 && (
                    <EventPaginator currentPage={currentPage ?? 1} totalPages={totalPages ?? 1} 
                        onPageChange={(page) => handlePageChange(page)} 
                    />
                )}
        </View>
    )
};

export default AttendedContent;
