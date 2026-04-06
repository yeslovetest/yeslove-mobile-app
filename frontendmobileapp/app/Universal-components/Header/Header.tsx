import React, { useState } from 'react';
import { Animated, Easing, Image, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import styles from './HeaderStyles';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { goBackToPreviousTabAction, openTabOnTopAction, TabType } from '../../store/Navigation/navigationSlice';
import PostModal from '@/app/pages/Home/Post-modal/PostModal';
import Ionicons from '@expo/vector-icons/Ionicons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { fetchFriendList } from '@/app/store/Chat/chatSlice';
import ChatbotProfile from '@/app/pages/Home/Messages/Chatbot/Chatbot-components/Chatbot-profile/ChatbotProfile';
import theme from '@/assets/variables/Variables';

export interface Props {
  mainTitle?: string;
  icon?: string;
  onEventsFilterPress?: () => void;
}

export default function Header(props: Props) {
  const userId = useAppSelector(state => state.user.id);
  const isCurrentUserProfile = useAppSelector(state => state.profile.isCurrentUserProfile);
  const tabStack = useAppSelector(state => state.navigation.tabStack);
  const hasTabToGoBackTo = useAppSelector(state => state.navigation.tabStack.length > 1);
  const dispatch = useAppDispatch();
  const currentTab = tabStack[tabStack.length - 1]?.type;
  // Shared assistant avatar used in the Get-help header CTA.
  const assistantAvatar = require('../../pages/Home/Messages/Chatbot/Chatbot-assets/robot.webp');
  // Animation driver for the periodic wave motion.
  const assistantMotion = React.useRef(new Animated.Value(0)).current;

  const [modalVisible, setModalVisible] = useState(false);

  const openPostModal = () => setModalVisible(true);
  const closePostModal = () => setModalVisible(false);

  const openSettings = () => {
    dispatch(openTabOnTopAction({ type: TabType.SETTINGS }))
  }

  const openMessages = () => {
    dispatch(fetchFriendList(userId || ''))
    dispatch(openTabOnTopAction({ type: TabType.MESSAGES,  data: { userId: userId }  }))
  }

  const returnToPreviousTab = () => {
    dispatch(goBackToPreviousTabAction());
  };

  // Opens the assistant chat screen from the Get-help header avatar.
  const openChatbot = () => {
    dispatch(openTabOnTopAction({ type: TabType.CHATBOT }));
  };

  React.useEffect(() => {
    // Keep animation active only on the root Get-help screen.
    if (hasTabToGoBackTo || currentTab !== TabType.GET_HELP) {
      assistantMotion.stopAnimation();
      assistantMotion.setValue(0);
      return;
    }

    // Small looping wave with a gentle pulse so it attracts attention without feeling noisy.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(1550),
        Animated.timing(assistantMotion, {
          toValue: 1,
          duration: 230,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(assistantMotion, {
          toValue: -0.65,
          duration: 220,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(assistantMotion, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    // Ensure animation resources are cleaned up when header mode changes.
    return () => {
      loop.stop();
      assistantMotion.stopAnimation();
      assistantMotion.setValue(0);
    };
  }, [assistantMotion, currentTab, hasTabToGoBackTo]);

  const assistantRotate = assistantMotion.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const assistantLift = assistantMotion.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, -1, -3],
  });

  const assistantScale = assistantMotion.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0.99, 1, 1.045],
  });

  const assistantGlowOpacity = assistantMotion.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0.06, 0.12, 0.24],
  });

  return (
    <View
    style={[
      styles.header,
      currentTab === TabType.CHATBOT && { backgroundColor: theme.colors.primaryBlue }, 
    ]}
  >
      {hasTabToGoBackTo && currentTab !== TabType.CHATBOT && (
        <View style={styles.headerDistribution}>
          <FontAwesome5 
          onPress={returnToPreviousTab} 
          name="chevron-left" size={20} 
          />
          {hasTabToGoBackTo && currentTab === TabType.MESSAGES && (
            <Text style={styles.title}>{props.mainTitle}</Text>
          )}
          <View />
        </View>
      )}

       {hasTabToGoBackTo && currentTab === TabType.CHATBOT && (
        <View style={styles.headerDistribution}>
          <ChatbotProfile></ChatbotProfile>
          <Ionicons onPress={returnToPreviousTab} name="close" size={32} color="white" />
        </View>
      )}


      {!hasTabToGoBackTo && currentTab === TabType.HOME && (
        <View style={styles.homeHeaderDistribution}>
          <Text style={[styles.title, styles.homeTitle]}>{props.mainTitle}</Text>
          <View style={styles.homeActions}>
            <TouchableOpacity style={styles.homeActionButton} onPress={openPostModal} activeOpacity={0.8}>
              <Ionicons name="add" size={25} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.homeActionButton, styles.homeActionSpacing]}
              onPress={openMessages}
              activeOpacity={0.8}
            >
              <SimpleLineIcons name="bubbles" size={21} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!hasTabToGoBackTo && isCurrentUserProfile && currentTab === TabType.PROFILE && (
        <View style={styles.headerDistribution}>
          <View />
          <Text style={styles.title}>{props.mainTitle}</Text>
          <TouchableOpacity onPress={openSettings}>
            <Ionicons name="settings-outline" size={28} color="black" />
          </TouchableOpacity>
        </View>
      )}

      {!hasTabToGoBackTo && currentTab === TabType.EVENTS && (
        <View style={styles.homeHeaderDistribution}>
          <Text style={[styles.title, styles.homeTitle]}>{props.mainTitle}</Text>
          <TouchableOpacity
            style={[styles.homeActionButton, styles.homeMessagesIcon]}
            onPress={props.onEventsFilterPress}
            pressRetentionOffset={10}
            hitSlop={10}
            activeOpacity={0.8}
          >
            <Ionicons name="filter" size={20} color="black" />
          </TouchableOpacity>
        </View>
      )}

      {!hasTabToGoBackTo && currentTab === TabType.NOTIFICATIONS && (
        <View style={styles.headerDistribution}>
          <View />
          <Text style={styles.title}>{props.mainTitle}</Text>
          <View></View>
        </View>
      )}

      {!hasTabToGoBackTo && currentTab === TabType.GET_HELP && (
        <View style={styles.homeHeaderDistribution}>
          <Text style={[styles.title, styles.homeTitle]}>{props.mainTitle}</Text>
          {/* Tapping the avatar opens the AI assistant page. */}
          <TouchableOpacity style={[styles.assistantButton, styles.homeMessagesIcon]} onPress={openChatbot} activeOpacity={0.85}>
            <Animated.View
              style={[
                styles.assistantBadge,
                {
                  // Rotation, lift, and tiny scale create a calm, attention-guiding motion.
                  transform: [{ rotate: assistantRotate }, { translateY: assistantLift }, { scale: assistantScale }],
                },
              ]}
            >
              <Animated.View style={[styles.assistantGlow, { opacity: assistantGlowOpacity }]} />
              <Image source={assistantAvatar} style={styles.assistantImage} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      )}

      {/* post modal */}
      <PostModal visible={modalVisible} onClose={closePostModal} />
    </View>
  );
}
