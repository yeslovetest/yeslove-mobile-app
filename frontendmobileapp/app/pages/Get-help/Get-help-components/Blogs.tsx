import { View } from "react-native"
import OneBlog from "./OneBlog"
import BlogSearchBar from "./BlogSearchBar"
import styles from "@/app/pages/Get-help/Get-help-styles/GetHelpStyles"
import blogPlaceholders from "./placeholderBlogs"

const Blogs = () => {
  return (
    <View >
      <BlogSearchBar />
      <View style={styles.blogsContainer}>
        {blogPlaceholders.map((blogPlaceholder, index) => (
      <OneBlog blog={blogPlaceholder} key={index} />
      ))}
      </View>
    </View>
  )
}

export default Blogs
