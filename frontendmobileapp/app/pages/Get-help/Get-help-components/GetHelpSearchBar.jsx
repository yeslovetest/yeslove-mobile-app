import React from 'react';
import { View, TextInput } from 'react-native';
import styles from "../Get-help-styles/GetHelpStyles";


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
