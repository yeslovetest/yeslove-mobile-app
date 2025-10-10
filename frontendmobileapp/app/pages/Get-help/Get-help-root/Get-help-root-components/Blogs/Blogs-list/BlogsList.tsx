import { View } from "react-native"
import OneBlog from "../One-blog/OneBlog"
import styles from "./BlogsListStyles"
import { useAppSelector } from "@/app/store/hooks"


const BlogsList = () => {

  const blogs = useAppSelector(state => state.getHelp.blogs);

  return (
    <View >
      <View style={styles.blogsContainer}>
        {blogs.map((blog, index) => (
          <OneBlog blog={blog} key={index} />
        ))}
      </View>
    </View>
  )
}

export default BlogsList
