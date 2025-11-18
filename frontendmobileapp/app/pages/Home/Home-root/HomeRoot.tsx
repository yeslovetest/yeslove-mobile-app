import React, { useRef, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import sharedStyles from '../HomeSharedStyles';
import HomeNavbar from './Home-root-components/Home-navbar/HomeNavbar';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { FeedTabs, setScrollViewPosition, updatePostsForFeedAction } from '../../../store/Home-store/feedSlice';
import OrangeBanner from '@/app/Universal-components/Orange-banner/OrangeBanner';
import Header from '../../../Universal-components/Header/Header';
import ScrollToTop from '@/app/pages/Home/Home-root/Home-root-components/Scroll-to-top/ScrollToTop';
import AllUpdatesContent from './Home-root-components/All-updates/AllUpdatesContent';
import FriendsContent from './Home-root-components/Friends/FriendsContent';

export default function HomeRoot() {

  const scrollViewRef = useRef<ScrollView>(null);
  const dispatch = useAppDispatch()
  const scrollViewPosition = useAppSelector(state => state.feed.scrollViewPosition);
  const scrollToTopAction = useAppSelector(state => state.feed.scrollToTopAction);
  const paginationValues = useAppSelector(state => state.feed.paginationValues);
  const activeHomeTab = useAppSelector(state => state.feed.view.activeHomeTab);


  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current && scrollViewPosition > 0) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: scrollViewPosition, animated: false });
        }, 10);
      }
    }, [])
  );

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    dispatch(setScrollViewPosition(0));
  }, [scrollToTopAction]);

  const THRESHOLD = 400; // how close to bottom before fetching more Posts

  const handleScroll = (event) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;

    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - THRESHOLD;

    // save scroll position
    dispatch(setScrollViewPosition(contentOffset.y));

    if (isCloseToBottom) {
      if (paginationValues.hasNextPage) {
        if (activeHomeTab=== FeedTabs.ALL_UPDATES){
          dispatch(updatePostsForFeedAction({feedType: 'all', page: paginationValues?.currentPage + 1}));
        } 
        else if (activeHomeTab=== FeedTabs.FRIENDS){
          dispatch(updatePostsForFeedAction({feedType: 'friends', page: paginationValues?.currentPage + 1}));
        }
      }
      
    }
  };


  return (
    <>
      <Header mainTitle="Yeslove!"></Header>
      <ScrollView ref={scrollViewRef} 
        contentContainerStyle={sharedStyles.contentContainer} 
        style={sharedStyles.container}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <OrangeBanner icon="newspaper" mainTitle="Newsfeed" description="Share and hear stories" />
        <HomeNavbar />

        {activeHomeTab === FeedTabs.ALL_UPDATES && (
          <AllUpdatesContent />
        )}


        {activeHomeTab === FeedTabs.FRIENDS && (
          <FriendsContent />
        )}
      </ScrollView>
      {scrollViewPosition > 0 && <ScrollToTop />}

    </>
  );
}

