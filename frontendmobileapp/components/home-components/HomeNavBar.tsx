import React from 'react';
import { View, TouchableOpacity, Text } from "react-native";
import styles from "../../Styles/page-styles/HomeStyles";
import AllUpdatesPosts from './AllUpdatesPosts';
import FriendsPosts from './FriendsPosts';
import { FeedTabs, setActiveHomeTabAction } from "../../app/store/feedSlice";
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';


const HomeNavBar = () => {
    const activeHomeTab = useAppSelector(state => state.feed.view.activeHomeTab);
    const dispatch = useAppDispatch();

    return (
        <View>
            {/* About Navbar */}
            <View style={styles.homeNavBarContainer}>
                <View style={styles.homeNavBar}>
                    <TouchableOpacity style={[styles.homeItem, activeHomeTab === FeedTabs.ALL_UPDATES && styles.activeHomeItem]} onPress={() => dispatch(setActiveHomeTabAction(FeedTabs.ALL_UPDATES))}>
                        <Text style={[styles.navText, activeHomeTab === FeedTabs.ALL_UPDATES && styles.activeHomeNavText]}>All Updates</Text>
                        {activeHomeTab === FeedTabs.ALL_UPDATES && <View style={styles.activeIndicator} />}
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.homeItem, activeHomeTab === FeedTabs.FRIENDS && styles.activeHomeItem]} onPress={() => dispatch(setActiveHomeTabAction(FeedTabs.FRIENDS))}>
                        <Text style={[styles.navText, activeHomeTab === FeedTabs.FRIENDS && styles.activeHomeNavText]}>Friends</Text>
                        {activeHomeTab === FeedTabs.FRIENDS && <View style={styles.activeIndicator} />}
                    </TouchableOpacity>
                </View>
            </View>

            {/* all updates*/}
            {activeHomeTab === FeedTabs.ALL_UPDATES && (
                <View>
                    <AllUpdatesPosts />
                </View>
            )}


            {/* friends*/}
            {activeHomeTab === FeedTabs.FRIENDS && (
                <View>
                    <FriendsPosts />
                </View>
            )}
        </View>
    )
}

export default HomeNavBar
