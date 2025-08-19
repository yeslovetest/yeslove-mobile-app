import { View, TextInput } from "react-native";
import styles from "@/app/pages/Get-help/Get-help-styles/GetHelpStyles";

const BlogSearchBar = () => {
  return (
    <View>
        <View style={styles.searchBarContainer}>
                <TextInput placeholder='Search Blogs...' placeholderTextColor="gray"  style={styles.searchBar}></TextInput>
               </View>
    </View>
  )
}

export default BlogSearchBar
