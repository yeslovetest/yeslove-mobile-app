import { View, Text, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
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

        <Text style={styles.label}>First Name</Text>
        <TextInput
        style={styles.input}
        placeholder="Enter first name"
        onChangeText={signupAction.handleFirstNameChange}
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
        style={styles.input}
        placeholder="Enter last name"
        onChangeText={signupAction.handleLastNameChange}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
        style={styles.input}
        placeholder="Enter phone number"
        keyboardType='number-pad'
        onChangeText={signupAction.handlePhoneChange}
        />

        <Text style={styles.label}>Username</Text>
        <TextInput
        onChangeText={signupAction.handleUsernameChange}
        style={styles.input}
        placeholder="Enter username"
        />

        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={signupAction.handleSignup}>
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