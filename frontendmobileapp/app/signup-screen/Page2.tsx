import { View, Text, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { useSignup } from '@/hooks/signUpLogic';
import styles from "../../Styles/page-styles/SignupStyles"
import theme from '@/Styles/Variables';

const image = {
  uri: "https://images.unsplash.com/vector-1741103791953-12eca7b8e3c7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxibHVlJTIwYWJzdHJhY3QlMjBzaGFwZXMlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
};

const Page2 = () => {
  const {
    email,
    password,
    confirm_password,
    pageNumber,
    emailBdColor,
    passwordBdColor,
    usernameBdColor,
    firstNameBdColor,
    lastNameBdColor,
    phoneBdColor,
    ...signupAction
  } = useSignup();

  const signupEmail = useAppSelector((state) => state.auth.signupEmail);
  const signupPassword = useAppSelector((state) => state.auth.signupPassword);
  const signupConfirmPassword = useAppSelector((state) => state.auth.signupPassword);

  return (
    
    <ImageBackground source={image} style={styles.container} resizeMode="cover" imageStyle={{ opacity: 1, height: "110%" }}>
    <View style={styles.innerContainer}>
        <Text style={styles.title}>SIGN UP TO YESLOVE!</Text>

        <Text style={styles.label}>First Name</Text>
        <TextInput
        style={{...styles.input, borderColor: firstNameBdColor[0], borderBottomColor: firstNameBdColor[1]}}
        placeholder="Enter first name"
        onChangeText={signupAction.handlefirst_nameChange}
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
        style={{...styles.input, borderColor: lastNameBdColor[0], borderBottomColor: lastNameBdColor[1]}}
        placeholder="Enter last name"
        onChangeText={signupAction.handlelast_nameChange}
        />

        <Text style={styles.label}>phone_number Number</Text>
        <TextInput
        style={{...styles.input, borderColor: phoneBdColor[0], borderBottomColor: phoneBdColor[1]}}
        placeholder="Enter phone number"
        keyboardType='number-pad'
        onChangeText={signupAction.handlephone_numberChange}
        />

        <Text style={styles.label}>Username</Text>
        <TextInput
        onChangeText={signupAction.handleUsernameChange}
        style={{...styles.input, borderColor: usernameBdColor[0], borderBottomColor: usernameBdColor[1]}}
        placeholder="Enter username"
        />

        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => signupAction.handleSignup(signupEmail, signupPassword, signupConfirmPassword)}>
            <Text style={styles.buttonText}>SIGN UP</Text>
            </TouchableOpacity>  
        </View>
    
        <Text style={styles.containerFooter}>
        Go  <Text style={{...styles.footerLink, color: theme.colors.footerFontColor, textDecorationLine: 'underline'}} onPress={signupAction.moveToPrevious}>Back  </Text> 
            to  previous  page
        </Text>
    </View>
    </ImageBackground>    
  );
};

export default Page2;