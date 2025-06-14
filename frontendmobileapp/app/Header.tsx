import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import styles from "../Styles/component-styles/HeaderStyles"
import { useAppDispatch, useAppSelector } from './store/hooks';
import { goBackToPreviousTabAction } from './store/navigationSlice';

export default function Header() {
  const hasTabToGoBackTo = useAppSelector(state => state.navigation.tabStack.length > 1);
  const dispatch = useAppDispatch();
  const returnToPreviousTab = () => {
    dispatch(goBackToPreviousTabAction())
  }
  return (
    <View style={styles.header}>
      {!hasTabToGoBackTo && <Text style={styles.title}>Yeslove!</Text>}
      {hasTabToGoBackTo && <FontAwesome5 onClick={returnToPreviousTab} name="chevron-left" />}
      <FontAwesome5 onClick={() => {throw Error("Not Implemented")}} style={styles.profile} size={24} name="user-alt" />
    </View>
  );
}


