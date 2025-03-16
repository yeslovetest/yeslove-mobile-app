import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from "expo-router";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function Header() {
  const router = useRouter()
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Yeslove!</Text>
      <FontAwesome5 onClick={() => router.replace("/(tabs)/profile")} style={styles.profile} size={24} name="user-alt" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 70,
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingLeft: 20, 
    paddingTop: 5,
    marginTop: 0,
    justifyContent: 'space-between', 
  },
  title: {
    color: '#007bff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profile: {
    marginRight: 15,
  }
});


