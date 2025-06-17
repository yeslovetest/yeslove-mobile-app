import { View, Text, TextInput, TouchableOpacity, ImageBackground, ScrollView, Dimensions } from 'react-native';
import { useRef, useState } from 'react';
import { useSignup } from '@/hooks/signUpLogic';
import styles from "../../Styles/page-styles/SignupStyles"
import theme from '@/Styles/Variables';

const image = {
  uri: "https://images.unsplash.com/vector-1741103791953-12eca7b8e3c7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxibHVlJTIwYWJzdHJhY3QlMjBzaGFwZXMlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
};

const SignUpScreen = () => {
  const {
    handleUsernameChange,
    handlePasswordChange,
    handleConfirmPassword,
    handleEmailChange,
    handlePhoneChange,
    handleFirstNameChange,
    handleLastNameChange,
    handleLoginStateChange, 
    handleSignup,
    validateInputs,
  } = useSignup();

  const [passwordBdColor, setPasswordBdColor] = useState(['#ccc', theme.colors.primaryBlue]);
  const [emailBdColor, setEmailBdColor] = useState(['#ccc', theme.colors.primaryBlue]);

  const {height} = Dimensions.get('window');
  const scrollViewRef = useRef(null);

  const scrollToNext = () => {
    const [result, field] = validateInputs(1);
    if (result){
      scrollViewRef.current?.scrollTo({ y: height, animated: true });
    }
    else {
      if (field == 'password') {
        setPasswordBdColor(['red', 'red']);
        setEmailBdColor(['#ccc', theme.colors.primaryBlue])
      }
      else if (field == 'email') {
        setEmailBdColor(['red', 'red']);
        setPasswordBdColor(['#ccc', theme.colors.primaryBlue]);
      }
    }
    
  };


  return (
    <ImageBackground source={image} style={styles.container} resizeMode="cover" imageStyle={{ opacity: 1, height: "110%" }}>
      <View style={styles.innerContainer}>
        <ScrollView style={styles.scrollContainer} 
        ref={scrollViewRef}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}>
            
            <Text style={styles.title}>SIGN UP TO YESLOVE!</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
            style={{...styles.input, borderColor: emailBdColor[0], borderBottomColor: emailBdColor[1]}}
            placeholder="Enter email"
            keyboardType='email-address'
            onChangeText={handleEmailChange}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
            onChangeText={handlePasswordChange}
            style={{...styles.input, borderColor: passwordBdColor[0], borderBottomColor: passwordBdColor[1]}}
            placeholder="Enter password"
            secureTextEntry
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
            onChangeText={handleConfirmPassword}
            style={{...styles.input, borderColor: passwordBdColor[0], borderBottomColor: passwordBdColor[1]}}
            placeholder="Confirm password"
            secureTextEntry
            />

            <TouchableOpacity style={styles.buttonNext} onPress={scrollToNext}>
              <Text style={styles.buttonText}><Text style={styles.greyText}>Let's get to know you more!.</Text> Next</Text>
            </TouchableOpacity> 

            <Text style={styles.label}>First Name</Text>
            <TextInput
            style={styles.input}
            placeholder="Enter first name"
            onChangeText={handleFirstNameChange}
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
            style={styles.input}
            placeholder="Enter last name"
            onChangeText={handleLastNameChange}
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            keyboardType='number-pad'
            onChangeText={handlePhoneChange}
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
            onChangeText={handleUsernameChange}
            style={styles.input}
            placeholder="Enter username"
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleSignup}>
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