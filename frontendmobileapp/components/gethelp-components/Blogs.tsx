import { View } from "react-native"
import OneBlog from "./OneBlog"
import BlogSearchBar from "./BlogSearchBar"
import styles from "@/Styles/page-styles/GetHelpStyles"
import { useAppSelector } from "@/app/store/hooks"

const Blogs = () => {

  const blogs = useAppSelector(state => state.getHelp.blogs);

  return (
    <View >
      <BlogSearchBar /> 
      <View style={styles.blogsContainer}>
        {blogs.map((blog, index) => (
          <OneBlog blog={blog} key={index} />
        ))}
      </View>
    </View>
  )
}

export default Blogs
