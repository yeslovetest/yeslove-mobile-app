import { View } from "react-native"
import OneBlog from "../One-blog/OneBlog"
import styles from "./BlogsListStyles"
import blogPlaceholders from "./PlaceholderBlogs"

const BlogsList = () => {
  return (
    <View >
      <View style={styles.blogsContainer}>
        {blogPlaceholders.map((blogPlaceholder, index) => (
      <OneBlog blog={blogPlaceholder} key={index} />
      ))}
      </View>
    </View>
  )
}

export default BlogsList
