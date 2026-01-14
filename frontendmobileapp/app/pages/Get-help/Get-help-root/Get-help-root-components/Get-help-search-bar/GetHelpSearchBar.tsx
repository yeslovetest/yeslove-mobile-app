import { View, TextInput, TouchableOpacity, Text } from "react-native";
import styles from "./GetHelpSearchBarStyles";
import { useAppDispatch } from "@/app/store/hooks";
import { fetchBlogPosts, setSearchQuery } from "@/app/store/Get-help-store/getHelpSlice";
import { useState } from "react";

export interface Props {
  placeholder: string,
  currentSection?: string,  // "blogs" or "professionals"
}

const GetHelpSearchBar = (props:Props) => {

  const dispatch = useAppDispatch();
  const [searchWord, setSearchWord] = useState(""); // State to hold the search input

  const searchAction = () => {
    if (props.currentSection === 'professionals') {
      //search professional logic 
      dispatch(setSearchQuery(searchWord));
      
      return;
    }

    if (props.currentSection === 'blogs') {
      //search blog logic
      dispatch(fetchBlogPosts({searchquery: searchWord}));
      dispatch(setSearchQuery(searchWord));
      return;      
    }
   
  }
  return (
    <View>
      <View style={styles.searchBarContainer}>
        <TextInput placeholder={props.placeholder} 
        onChangeText = {(val) => setSearchWord(val)}
        placeholderTextColor="gray" style={styles.searchBar}>
        </TextInput>
        <TouchableOpacity style={styles.searchButton}  onPress={searchAction}>
           <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      
      </View>
    </View>
  )
}

export default GetHelpSearchBar
