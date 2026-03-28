import { View, TextInput, TouchableOpacity, Text } from "react-native";
import styles from "./GetHelpSearchBarStyles";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { fetchBlogPosts, setSearchQuery } from "@/app/store/Get-help-store/getHelpSlice";
import { useEffect, useState } from "react";

export interface Props {
  placeholder: string,
  currentSection?: string,  // "blogs" or "professionals"
}

const GetHelpSearchBar = (props:Props) => {

  const dispatch = useAppDispatch();
  const savedSearchQuery = useAppSelector(state => state.getHelp.currentSearchQuery);
  const [searchWord, setSearchWord] = useState(savedSearchQuery); // Keep input aligned with stored filter state.

  useEffect(() => {
    setSearchWord(savedSearchQuery);
  }, [savedSearchQuery]);

  const searchAction = () => {
    const trimmedSearchWord = searchWord.trim();

    if (props.currentSection === 'professionals') {
      //search professional logic 
      dispatch(setSearchQuery(trimmedSearchWord));
      setSearchWord(trimmedSearchWord);
      
      return;
    }

    if (props.currentSection === 'blogs') {
      //search blog logic
      dispatch(fetchBlogPosts({searchquery: trimmedSearchWord}));
      dispatch(setSearchQuery(trimmedSearchWord));
      setSearchWord(trimmedSearchWord);
      return;      
    }
   
  }
  return (
    <View>
      <View style={styles.searchBarContainer}>
        <TextInput placeholder={props.placeholder} 
        value={searchWord}
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
