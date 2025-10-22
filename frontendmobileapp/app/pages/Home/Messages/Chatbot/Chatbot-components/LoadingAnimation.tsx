import React, { useEffect, useRef } from 'react'
import { View, Animated } from 'react-native';
import styles from '../SharedChatbotStyles';
import ChatbotProfile from './Chatbot-profile/ChatbotProfile';

export default function LoadingAnimation() {
    const dots = [useRef(new Animated.Value(0.8)).current,
    useRef(new Animated.Value(0.8)).current,
    useRef(new Animated.Value(0.8)).current]

    useEffect(() => {
        const animations = dots.map((anim, i) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(i * 200),
                    Animated.timing(anim, {
                        toValue: 1.2,
                        duration: 750,
                        useNativeDriver: true
                    }),
                    Animated.timing(anim, {
                        toValue: 0.8,
                        duration: 750,
                        useNativeDriver: true
                    })
                ])
            )
        )
        Animated.stagger(100, animations).start()
    }, [])

    return (
        <View style={styles.dotsContainer}>
            <ChatbotProfile></ChatbotProfile>
<View style={styles.loadingContainer}>
            {dots.map((anim, i) => (
                <Animated.View
                    key={i}
                    style={[
                        styles.dot,
                        {
                            transform: [{ scale: anim }],
                            opacity: anim.interpolate({
                                inputRange: [0.8, 1.2],
                                outputRange: [0.7, 1]
                            }),
                        }
                    ]}
                />
            ))}
            </View>
        </View>
    )
}



