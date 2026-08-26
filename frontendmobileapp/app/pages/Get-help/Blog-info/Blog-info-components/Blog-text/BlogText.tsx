import { Text, View } from "react-native";
import { BlogPostModel as Blog } from "@/generated-api";
import { useAppSelector } from "@/app/store/hooks";
import styles from "./BlogTextStyles";
import { formatLargeTextContent } from "@/utils/largeTextFormatter";

const BlogText = () => {
  const blog: Blog = useAppSelector((state) => state.navigation.tabStack.at(-1)?.data) as Blog;
  const lines = formatLargeTextContent(blog.content);

  return (
    <View style={styles.contentContainer}>
      {lines.map((line, index) => {
        return (
          <Text
            key={`${index}-${line.text.slice(0, 12)}`}
            style={line.isHeading ? styles.blogHeading : styles.blogText}
          >
            {line.text}
          </Text>
        );
      })}
    </View>
  );
};

export default BlogText;
