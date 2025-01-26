import { Image, StyleSheet, Platform, Text, View, ScrollView, Header } from 'react-native';

export default function ProfilePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Profile Page!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});
