import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import styles from './HeaderStyles';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { goBackToPreviousTabAction, openTabOnTopAction, TabType } from '../../store/Navigation/navigationSlice';
import PostModal from '@/app/pages/Home/Post-modal/PostModal';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { fetchFriendList } from '@/app/store/Chat/chatSlice';
import ChatbotProfile from '@/app/pages/Home/Messages/Chatbot/Chatbot-components/Chatbot-profile/ChatbotProfile';
import theme from '@/assets/variables/Variables';

export interface Props {
  mainTitle?: string;
  icon?: string;
}

export default function Header(props: Props) {
  const userId = useAppSelector(state => state.user.id);
  const isCurrentUserProfile = useAppSelector(state => state.profile.isCurrentUserProfile);
  const tabStack = useAppSelector(state => state.navigation.tabStack);
  const hasTabToGoBackTo = useAppSelector(state => state.navigation.tabStack.length > 1);
  const dispatch = useAppDispatch();
  const currentTab = tabStack[tabStack.length - 1]?.type;

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

  return (
    <View
    style={[
      styles.header,
      currentTab === TabType.CHATBOT && { backgroundColor: theme.colors.primaryBlue }, 
    ]}
  >
      {hasTabToGoBackTo && currentTab !== TabType.CHATBOT && (
        <View style={styles.headerDistribution}>
          <FontAwesome5 onPress={returnToPreviousTab} name="chevron-left" size={20} />
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
        <View style={styles.headerDistribution}>
          <TouchableOpacity onPress={openPostModal}>
            <Ionicons name="add" size={25} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>{props.mainTitle}</Text>
          <SimpleLineIcons onPress={openMessages} name="bubbles" size={24} color="black" />
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
        <View style={styles.headerDistribution}>
          <View />
          <Text style={styles.title}>{props.mainTitle}</Text>
          <View />
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
        <View style={styles.headerDistribution}>
          <View />
          <Text style={styles.title}>{props.mainTitle}</Text>
          {/*bot icon that will later direct to the chatbot */}
          <MaterialCommunityIcons name="robot-love" size={25} color="black" />
        </View>
      )}

      {/* post modal */}
      <PostModal visible={modalVisible} onClose={closePostModal} />
    </View>
  );
}
