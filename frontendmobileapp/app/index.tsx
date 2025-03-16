import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react';
import { useRouter } from "expo-router";
import axios from 'axios';
import {ApiApiFactory, ApiApi } from "../generated-api/api";
import { TOKEN_REFRESH_SERVICE } from '@/ts/token-refresh-service';
import { useDispatch } from 'react-redux';
import { setUser } from './store/userSlice';


const Login = () => {
const router = useRouter();
const dispatch = useDispatch();
const [password, setPassword] = useState("");
const [username, setUsername] = useState("");


const handleLogin = () => {
  testLogin(username, password)
}

const handlePasswordChange = (input: React.SetStateAction<string>) => {
  setPassword(input)
}

const handleUsernameChange = (input: React.SetStateAction<string>) => {
  setUsername(input)
}

const testLogin = (username: string, password: string) => {
  axios.defaults.baseURL = "http://localhost:5000";

  const apiInstance = ApiApiFactory(); 
  console.log(apiInstance);

  ApiApiFactory().postLogin({password: password, username: username})
  .then((response) => {
    dispatch(setUser({ name: username }));
    axios.defaults.headers.common['Authorization'] = response.data.access_token ?? "";
    TOKEN_REFRESH_SERVICE.startRefreshingToken(response.data.refresh_token ?? "")
    
    //fetch all user details on login

    
    ApiApiFactory()
       .getUserProfile("agsvskdsjaksvauava")
        .then((profileResponse) => {
          dispatch(setUser(profileResponse.data)); 
        })
        .catch((error) => {
          console.error("Failed to fetch user profile:", error);
        });
    
    ;
    router.replace("/(tabs)/home");  
  }).catch((error) => {
    console.error('Login failed:', error);
  });

};



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <Text style={styles.label}>Username</Text>
      <TextInput onChangeText={handleUsernameChange} value={username} style={styles.input} placeholder="Enter username" />

      <Text style={styles.label}>Password</Text>
      <TextInput onChangeText={handlePasswordChange} value={password} style={styles.input} placeholder="Enter password" secureTextEntry={true} />
    
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  )
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: 400,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
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


export default Login