import { Text } from "react-native";
import { useAppSelector } from '@/app/store/hooks';
import styles from "@/Styles/page-styles/GetHelpStyles";
import { BlogPost } from "@/generated-api";

const BlogContent = () => {
       const blog: BlogPost = useAppSelector(state => state.navigation.tabStack.at(-1)?.data) as BlogPost;
  
  return (
    <Text style={styles.blogContentText}>
      {blog.content}
    </Text>
  )
}

export default BlogContent
