import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { ApiApi } from '@/generated-api';

export default function HomeScreen() {
const router = useRouter()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Home Page!</Text>
    </View>
  );
}

export function testLogin() {
  console.log("AAA")
  axios.post(
    'http://localhost:8080/realms/master/protocol/openid-connect/token',
    new URLSearchParams({
        response_type: 'token',
        scope: 'openid',
        client_id: 'yeslove',
        client_secret: 'kKDqlBTi0o5NtREvVyKjf1IjisGw5jqu',
        username: 'admin',
        password: 'change_me',
        grant_type: 'password',
    }),
    {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }
).then((response) => {
  console.log('Access Token:', response.data.access_token);
});
  
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
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
