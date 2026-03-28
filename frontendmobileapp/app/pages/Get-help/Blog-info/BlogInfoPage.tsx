import React, { useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View } from "react-native";
import styles from "./BlogInfoPageStyles";
import BlogContent from "./Blog-info-components/Blog-text/BlogText";
import BlogTitle from "./Blog-info-components/Blog-header/BlogHeader";
import Header from "@/app/Universal-components/Header/Header";

const BlogInfoPage = () => {
    const [scrollProgress, setScrollProgress] = useState(0);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const maxScrollable = contentSize.height - layoutMeasurement.height;

        if (maxScrollable <= 0) {
            setScrollProgress(1);
            return;
        }

        const progress = Math.min(1, Math.max(0, contentOffset.y / maxScrollable));
        setScrollProgress(progress);
    };

    return (
        <>
        <Header></Header>
        <View style={styles.screenContainer}>
        <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${scrollProgress * 100}%` }]} />
            </View>
        </View>
        <ScrollView
            contentContainerStyle={styles.contentContainer}
            style={styles.indBlogContainer}
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="automatic"
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
        >
            <BlogTitle />
            <BlogContent />
        </ScrollView>
        </View>
</>        
    )
}

export default BlogInfoPage
