import React from 'react';
import { StyleSheet, View } from 'react-native';
import TabLayout from './(tabs)/_layout';
import HomeScreen from './(tabs)/index';
import Header from './header.jsx'

export default function App() {
  return (
    <View style={styles.container}>
      <TabLayout>
        <HomeScreen />
      </TabLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
