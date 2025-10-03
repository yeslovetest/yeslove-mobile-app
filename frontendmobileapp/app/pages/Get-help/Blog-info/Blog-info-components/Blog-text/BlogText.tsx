import { Text } from "react-native";
import { BlogPostModel as Blog } from "@/generated-api";
import { useAppSelector } from '@/app/store/hooks';
import styles from "./BlogTextStyles";

const BlogText = () => {
       const blog: Blog = useAppSelector(state => state.navigation.tabStack.at(-1)?.data) as Blog;
  
  return (
    <Text style={styles.blogText}>
{blog.content}
    </Text>
  )
}

export default BlogText
