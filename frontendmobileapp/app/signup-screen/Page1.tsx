import { View, Text, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import { useSignup } from '@/hooks/signUpLogic';
import styles from "../../Styles/page-styles/SignupStyles"


const image = {
  uri: "https://images.unsplash.com/vector-1741103791953-12eca7b8e3c7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxibHVlJTIwYWJzdHJhY3QlMjBzaGFwZXMlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
};

const Page1 = () => {
  const {
    email,
    password,
    confirmPassword,
    pageNumber,
    emailBdColor,
    passwordBdColor,
    ...signupAction
  } = useSignup();


  return (
    <ImageBackground source={image} style={styles.container} resizeMode="cover" imageStyle={{ opacity: 1, height: "110%" }}>
        <View style={styles.innerContainer}>
        <Text style={styles.title}>SIGN UP TO YESLOVE!</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
            style={{...styles.input, borderColor: emailBdColor[0], borderBottomColor: emailBdColor[1]}}
            placeholder="Enter email"
            keyboardType='email-address'
            value={email}
            onChangeText={signupAction.handleEmailChange}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
            onChangeText={signupAction.handlePasswordChange}
            style={{...styles.input, borderColor: passwordBdColor[0], borderBottomColor: passwordBdColor[1]}}
            value={password}
            placeholder="Enter password"
            secureTextEntry
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
            onChangeText={signupAction.handleConfirmPassword}
            style={{...styles.input, borderColor: passwordBdColor[0], borderBottomColor: passwordBdColor[1]}}
            value={confirmPassword}
            placeholder="Confirm password"
            secureTextEntry
            />

            <TouchableOpacity style={styles.buttonNext} onPress={signupAction.moveToNext}>
            <Text style={styles.buttonText}><Text style={styles.greyText}>Let's get to know you more!.</Text> Next</Text>
            </TouchableOpacity> 

    
        <Text style={styles.containerFooter}>
        Already have an account?
            <Text style={styles.footerLink} onPress={() => signupAction.handleLoginStateChange('login')}> Login</Text>
        </Text>
        </View>
    </ImageBackground>
      
  );
};

export default Page1;