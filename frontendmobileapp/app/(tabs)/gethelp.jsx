import { Image, ImageBackground, StyleSheet, Platform, Text, View, ScrollView, Header } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import Entypo from '@expo/vector-icons/Entypo';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.ourProfessionalsContainer}>
        <ImageBackground source={{ uri: "https://yeslove.co.uk/wp-content/uploads/2021/04/shape_7.png" }} styles={styles.backgroundImage}>

        <View style={styles.contentRow}>
        <Entypo name="megaphone" size={42} color="white" style={styles.icon}/>
        
        <View style={styles.textContainer}>
          <Text style={styles.ourProfessionalsText}>Our Professionals</Text>
          <Text style={styles.ourProfessionalsCaption}>Browse the list of our professionals</Text>
        </View>
        </View>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  ourProfessionalsContainer: {
    backgroundImage: "linear-gradient(to right, #ff9800, #ffea00)",
    width: "90vw",
    height: 100,
    borderRadius: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 30
  },
  textContainer: {
    justifyContent: "center",
    alignItems: "flex-start"
  },
  ourProfessionalsText: {
    fontSize: 19,
    color: "#fff",
    fontWeight: 600
  },
  ourProfessionalsCaption: {
    fontSize: 13,
    color: "#fff",
    fontWeight: 600
  }

});
