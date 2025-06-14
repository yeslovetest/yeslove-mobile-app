import { View, Text, TextInput, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import React from 'react';
import { useLogin } from "../../hooks/loginLogic"
import styles from "../../Styles/page-styles/SignupStyles"

const image = {
  uri: "https://images.unsplash.com/vector-1741103791953-12eca7b8e3c7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxibHVlJTIwYWJzdHJhY3QlMjBzaGFwZXMlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
};

const SignUpScreen = () => {
  const {
    username,
    password,
    handleUsernameChange,
    handlePasswordChange,
    handleLogin,
    handleLoginStateChange,
  } = useLogin();

  return (
    <ImageBackground source={image} style={styles.container} resizeMode="cover" imageStyle={{ opacity: 1, height: "110%" }}>
      <View style={styles.innerContainer}>
        <ScrollView style={styles.scrollContainer}>
            
            <Text style={styles.title}>SIGN UP TO YESLOVE!</Text>
            
            <Text style={styles.label}>First Name</Text>
            <TextInput
            style={styles.input}
            placeholder="Enter first name"
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
            style={styles.input}
            placeholder="Enter last name"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
            style={styles.input}
            placeholder="Enter email"
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
            onChangeText={handleUsernameChange}
            value={username}
            style={styles.input}
            placeholder="Enter username"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
            onChangeText={handlePasswordChange}
            value={password}
            style={styles.input}
            placeholder="Enter password"
            secureTextEntry
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
            onChangeText={handlePasswordChange}
            value={password}
            style={styles.input}
            placeholder="Enter password"
            secureTextEntry
            />

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} >
                    <Text style={styles.buttonText}>SIGN UP</Text>
                </TouchableOpacity>  
            </View>
            
        </ScrollView>
        <Text style={styles.containerFooter}>
        Already have an account?
             <Text style={styles.footerLink} onPress={() => handleLoginStateChange('login')}> Login</Text>
        </Text>
      </View>
    </ImageBackground>
  );
};

export default SignUpScreen;