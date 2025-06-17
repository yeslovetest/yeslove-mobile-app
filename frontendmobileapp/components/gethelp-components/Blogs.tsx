import { View } from "react-native"
import OneBlog from "./OneBlog"
import BlogSearchBar from "./BlogSearchBar"

const Blogs = () => {
  return (
    <View>
      <BlogSearchBar />
      <OneBlog />
    </View>
  )
}

export default Blogs
