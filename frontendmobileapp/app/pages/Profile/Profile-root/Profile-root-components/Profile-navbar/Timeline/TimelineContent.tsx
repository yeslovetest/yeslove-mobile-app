import React, { useEffect } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { fetchUserTimelineAction } from '@/app/store/Profile-store/profileSlice';
import { BASE_URL } from '@/app/config/baseUrl';
import dayjs from 'dayjs';
import PostFilePreview from '@/app/pages/Home/Post-modal/Post-modal-components/File-preview/PostFilePreview';
import { retrieveOnePost } from '@/app/store/Home-store/feedSlice';
import styles from '@/app/pages/Profile/Profile-root/Profile-root-components/Profile-navbar/Timeline/TimelineContentStyles';
import { getImageSource } from '@/constants/imageFallbacks';

const TimelineContent = () => {
    const dispatch = useAppDispatch();

    const userId = useAppSelector((state) => state.navigation.tabStack.at(-1)?.data?.userId ?? '');
    const profile = useAppSelector((state) => state.profile.profiles[userId]);
    const activeTab = useAppSelector((state) => state.profile.view.activeTab);
    const timeline = useAppSelector((state) => state.profile.timeline);

    const resolveMediaUrl = (url?: string) => {
        if (!url) {
            return '';
        }

        if (/^https?:\/\//i.test(url)) {
            return url;
        }

        return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const resolveProfileImageUrl = (url?: string) => {
        if (!url) {
            return '';
        }

        if (/^https?:\/\//i.test(url)) {
            return url;
        }

        if (url.startsWith('/')) {
            return `${BASE_URL}${url}`;
        }

        return `${BASE_URL}/api/media/${url}`;
    };

    useEffect(() => {
        if (!userId || activeTab !== 'Timeline') {
            return;
        }

        const shouldInitializeTimeline = !timeline.initialized || timeline.keycloakId !== userId;
        if (shouldInitializeTimeline) {
            dispatch(fetchUserTimelineAction({ id: userId, page: 1, perPage: 10, reset: true }));
        }
    }, [activeTab, dispatch, timeline.initialized, timeline.keycloakId, userId]);

    const openDetailedPost = (postId?: number) => {
        if (!postId) {
            return;
        }

        dispatch(retrieveOnePost({ postID: postId }));
    };

    return (
        <View style={styles.container}>
            {timeline.posts.map((post, index) => {
                const postAuthorPic = resolveMediaUrl(post.author_pic);
                const profilePicFallback = resolveProfileImageUrl(profile?.profile_pic);
                const timelineCardImage = postAuthorPic || profilePicFallback;

                const postMedia = (post.media_files ?? [])
                    .filter((media) => !!(media as any)?.url || !!(media as any)?.uri)
                    .map((media) => ({
                        uri: resolveMediaUrl((media as any).url ?? (media as any).uri),
                        type: (media as any).content_type ?? (media as any).type ?? 'image/jpeg',
                    }));

                return (
                    <TouchableOpacity
                        key={String(post.id ?? `${post.timestamp}_${index}`)}
                        style={styles.postCard}
                        activeOpacity={0.9}
                        onPress={() => openDetailedPost(post.id)}
                    >
                        <View style={styles.headerRow}>
                            <Image
                                style={styles.profileImage}
                                source={getImageSource(timelineCardImage, 'profile')}
                            />
                            <View style={styles.authorInfo}>
                                <Text style={styles.authorName}>{profile?.username || 'User'}</Text>
                                <Text style={styles.timeText}>
                                    {post.timestamp ? dayjs(post.timestamp).format('MMM D, YYYY h:mm A') : 'Unknown date'}
                                </Text>
                            </View>
                        </View>

                        {!!post.content && <Text style={styles.contentText}>{post.content}</Text>}

                        {postMedia.length > 0 && (
                            <View style={styles.mediaWrap}>
                                <PostFilePreview file={postMedia} showNextPreview />
                            </View>
                        )}

                        <View style={styles.footerRow}>
                            <Text style={styles.footerMetric}>{post.likes ?? 0} likes</Text>
                            <Text style={styles.footerMetric}>{post.comments ?? 0} comments</Text>
                        </View>
                    </TouchableOpacity>
                );
            })}

            {timeline.loading && (
                <View style={styles.centerState}>
                    <ActivityIndicator size="small" color="#1d4ed8" />
                    <Text style={styles.stateText}>Loading timeline...</Text>
                </View>
            )}

            {!timeline.loading && timeline.posts.length === 0 && (
                <View style={styles.centerState}>
                    <Text style={styles.stateText}>No posts on this timeline yet.</Text>
                </View>
            )}

            {timeline.fetchingMore && !timeline.loading && (
                <View style={styles.centerState}>
                    <ActivityIndicator size="small" color="#1d4ed8" />
                    <Text style={styles.stateText}>Loading more posts...</Text>
                </View>
            )}

            {!timeline.loading && !timeline.fetchingMore && timeline.posts.length > 0 && !timeline.hasMore && (
                <View style={styles.centerState}>
                    <Text style={styles.endText}>You have reached the end of this timeline.</Text>
                </View>
            )}

            {!!timeline.error && !timeline.loading && (
                <View style={styles.centerState}>
                    <Text style={styles.errorText}>{timeline.error}</Text>
                </View>
            )}
        </View>
    );
};

export default TimelineContent;
