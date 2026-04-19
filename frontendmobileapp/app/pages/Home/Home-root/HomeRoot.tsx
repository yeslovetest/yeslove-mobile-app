import React, { useRef, useEffect } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import sharedStyles from '../HomeSharedStyles';
import HomeNavbar from './Home-root-components/Home-navbar/HomeNavbar';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { FeedTabs, setScrollViewPosition, updatePostsForFeedAction } from '../../../store/Home-store/feedSlice';
import { fetchFriendList } from '../../../store/Chat/chatSlice';
import OrangeBanner from '@/app/Universal-components/Orange-banner/OrangeBanner';
import Header from '../../../Universal-components/Header/Header';
import ScrollToTop from '@/app/pages/Home/Home-root/Home-root-components/Scroll-to-top/ScrollToTop';
import AllUpdatesContent from './Home-root-components/All-updates/AllUpdatesContent';
import FriendsContent from './Home-root-components/Friends/FriendsContent';

export default function HomeRoot() {

  const scrollViewRef = useRef<ScrollView>(null);
  const paginationRequestInFlightRef = useRef(false);
  const lastRequestedPageRef = useRef(1);
  const savedScrollPositionRef = useRef(0);
  const hasInitializedScrollToTopEffectRef = useRef(false);
  const dispatch = useAppDispatch()
  const scrollViewPosition = useAppSelector(state => state.feed.scrollViewPosition);
  const scrollToTopAction = useAppSelector(state => state.feed.scrollToTopAction);
  const paginationValues = useAppSelector(state => state.feed.paginationValues);
  const activeHomeTab = useAppSelector(state => state.feed.view.activeHomeTab);
  const userId = useAppSelector(state => state.user.id);

  useEffect(() => {
    savedScrollPositionRef.current = scrollViewPosition;
  }, [scrollViewPosition]);


  useFocusEffect(
    React.useCallback(() => {
      // Always refresh unread message state whenever Home regains focus.
      dispatch(fetchFriendList(userId || ''));

      const restoredPosition = savedScrollPositionRef.current;

      if (scrollViewRef.current && restoredPosition > 0) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: restoredPosition, animated: false });
        }, 10);
      }
    }, [dispatch, userId])
  );

  useEffect(() => {
    if (!hasInitializedScrollToTopEffectRef.current) {
      hasInitializedScrollToTopEffectRef.current = true;
      return;
    }

    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    dispatch(setScrollViewPosition(0));
  }, [scrollToTopAction]);

  useEffect(() => {
    // Unlock pagination when the requested page lands in state.
    if (paginationValues.currentPage >= lastRequestedPageRef.current) {
      paginationRequestInFlightRef.current = false;
    }
  }, [paginationValues.currentPage]);

  useEffect(() => {
    // Reset pagination lock when switching tabs to avoid stale lock state.
    paginationRequestInFlightRef.current = false;
    lastRequestedPageRef.current = paginationValues.currentPage ?? 1;
  }, [activeHomeTab]);

  // Keep prefetch distance generous to avoid loading gaps on slower mobile networks.
  const THRESHOLD = 400;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;

    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - THRESHOLD;

    if (isCloseToBottom) {
      // update feed when user is close to the bottom of the page
      if (paginationValues.hasNextPage && !paginationRequestInFlightRef.current) {
        const nextPage = (paginationValues?.currentPage ?? 1) + 1;
        paginationRequestInFlightRef.current = true;
        lastRequestedPageRef.current = nextPage;

        if (activeHomeTab=== FeedTabs.ALL_UPDATES){
          dispatch(updatePostsForFeedAction({feedType: 'all', page: nextPage}));
        } 
        else if (activeHomeTab=== FeedTabs.FRIENDS){
          dispatch(updatePostsForFeedAction({feedType: 'friends', page: nextPage}));
        }
      }
      
    }
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    dispatch(setScrollViewPosition(event.nativeEvent.contentOffset.y));
  };


  return (
    <>
      <Header mainTitle="Yeslove!"></Header>
      <ScrollView ref={scrollViewRef} 
        contentContainerStyle={sharedStyles.contentContainer} 
        style={sharedStyles.container}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
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

