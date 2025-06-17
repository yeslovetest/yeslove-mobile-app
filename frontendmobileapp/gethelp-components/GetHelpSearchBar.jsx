import React from 'react';
import { ScrollView, ImageBackground, StyleSheet, Platform, Text, View, Image, TouchableOpacity, TextInput } from 'react-native';
import styles from "../../Styles/page-styles/GetHelpStyles";


const GetHelpSearchBar = () => {
  return (
    <View>
         <View style={styles.searchBarContainer}>
          <TextInput placeholder='Search Members...' placeholderTextColor="gray"  style={styles.searchBar}></TextInput>
         </View>
    </View>
  )
}

export default GetHelpSearchBar
