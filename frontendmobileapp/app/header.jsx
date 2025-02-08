import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Yeslove!</Text>
      <FontAwesome5 style={styles.profile} name="user-alt" size={24} color="black" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 60,
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingLeft: 20, 
    paddingTop: 5,
    marginTop: 33,
    justifyContent: 'space-between', 
  },
  title: {
    color: '#007bff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profile: {
    marginRight: 30,
  }
});


