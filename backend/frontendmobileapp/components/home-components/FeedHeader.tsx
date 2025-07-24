import React from 'react'
import { ImageBackground, View, Text } from "react-native"
import styles from "../../Styles/page-styles/HomeStyles";
import Entypo from '@expo/vector-icons/Entypo';

const FeedHeader = () => {
  return (
    <View>
              <View style={styles.feedHeaderContainer}>
              <ImageBackground 
    style={styles.imageBackground} 
    source={{ uri: "https://yeslove.co.uk/wp-content/uploads/2021/04/shape_7.png" }} 
    resizeMode="cover"
  />
      
              <View style={styles.contentRow}>
              <Entypo name="megaphone" size={48} color="white" style={styles.icon}/>
              
              <View style={styles.textContainer}>
                <Text style={styles.feedHeaderText}>Newsfeed</Text>
                <Text style={styles.feedHeaderCaption}>Share and hear stories!</Text>
              </View>
              </View>
            </View>
    </View>
  )
}

export default FeedHeader
