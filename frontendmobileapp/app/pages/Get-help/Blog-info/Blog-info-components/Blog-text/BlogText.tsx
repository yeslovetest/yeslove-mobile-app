import { Text } from "react-native";
import blogPlaceholders, { Blog } from "../../../Get-help-root/Get-help-root-components/Blogs/Blogs-list/PlaceholderBlogs";
import { useAppSelector } from '@/app/store/hooks';
import styles from "./BlogTextStyles";

const BlogText = () => {
       const blog: Blog = useAppSelector(state => state.navigation.tabStack.at(-1)?.data) as Blog;
  
  return (
    <Text style={styles.blogText}>
{blog.text}
    </Text>
  )
}

export default BlogText
