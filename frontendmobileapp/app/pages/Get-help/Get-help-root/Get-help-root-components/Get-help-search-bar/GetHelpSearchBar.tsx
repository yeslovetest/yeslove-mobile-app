import { View, TextInput } from "react-native";
import styles from "./GetHelpSearchBarStyles";

export interface Props {
  placeholder: string
}

const GetHelpSearchBar = (props:Props) => {
  return (
    <View>
      <View style={styles.searchBarContainer}>
        <TextInput placeholder={props.placeholder} placeholderTextColor="gray" style={styles.searchBar}></TextInput>
      </View>
    </View>
  )
}

export default GetHelpSearchBar
