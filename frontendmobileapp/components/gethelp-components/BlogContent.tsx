import { Text } from "react-native";
import blogPlaceholders, { Blog } from "./placeholderBlogs";
import { useAppSelector } from '@/app/store/hooks';
import styles from "@/Styles/page-styles/GetHelpStyles";

const BlogContent = () => {
       const blog: Blog = useAppSelector(state => state.navigation.tabStack.at(-1)?.data) as Blog;
  
  return (
    <Text style={styles.blogContentText}>
{blog.content}
    </Text>
  )
}

export default BlogContent
