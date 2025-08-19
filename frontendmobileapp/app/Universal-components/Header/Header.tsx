import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import styles from './HeaderStyles';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { goBackToPreviousTabAction, TabType } from '../../store/Navigation/navigationSlice';
import PostModal from '@/app/pages/Home/Post-modal/PostModal';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export interface Props {
  mainTitle?: string;
  icon?: string;
}

export default function Header(props: Props) {
  const tabStack = useAppSelector(state => state.navigation.tabStack);
  const hasTabToGoBackTo = useAppSelector(state => state.navigation.tabStack.length > 1);
  const dispatch = useAppDispatch();
  const currentTab = tabStack[tabStack.length - 1]?.type;

  const [modalVisible, setModalVisible] = useState(false);

  const openPostModal = () => setModalVisible(true);
  const closePostModal = () => setModalVisible(false);

  const returnToPreviousTab = () => {
    dispatch(goBackToPreviousTabAction());
  };

  return (
    <View style={styles.header}>
      {hasTabToGoBackTo && (
        <View style={styles.headerDistribution}>
          <FontAwesome5 onPress={returnToPreviousTab} name="chevron-left" size={20} />
          <View />
        </View>
      )}

      {!hasTabToGoBackTo && currentTab === TabType.HOME && (
        <View style={styles.headerDistribution}>
          <TouchableOpacity onPress={openPostModal}>
            <FontAwesome5 name="plus" size={20} />
          </TouchableOpacity>
          <Text style={styles.title}>{props.mainTitle}</Text>
          <View />
        </View>
      )}

      {!hasTabToGoBackTo && currentTab === TabType.PROFILE && (
        <View style={styles.headerDistribution}>
          <View />
          <Text style={styles.title}>{props.mainTitle}</Text>
          <View />
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
          <FontAwesome5 name="comment-alt" size={20} />
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
