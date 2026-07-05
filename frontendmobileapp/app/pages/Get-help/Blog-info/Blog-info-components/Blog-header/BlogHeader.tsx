import { ImageBackground, Text, View } from "react-native";
import styles from "./BlogHeaderStyles";
import { BlogPostModel } from "@/generated-api";
import { useAppSelector } from "@/app/store/hooks";
import defaultBlogImg from "@/assets/images/blogimg2.png";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import dayjs from "dayjs";

const BlogHeader = () => {
  const blog: BlogPostModel = useAppSelector(
    (state) => state.navigation.tabStack.at(-1)?.data,
  ) as BlogPostModel;

  return (
    <View style={styles.indBlogContainer}>
      <Text style={styles.indBlogTitle}>{blog.title}</Text>
      <ImageBackground
        style={styles.blogImage}
        imageStyle={styles.blogImageContent}
        source={blog.image_url ? { uri: blog.image_url } : defaultBlogImg}
      ></ImageBackground>
      <View style={styles.indAuthorAndDateContainer}>
        <View style={styles.authorContainer}>
          <Ionicons name="person-sharp" size={21} style={styles.authorIcon} color="black" />
          <Text style={styles.dateAndAuthorText}>{blog.author ?? "YesLove Team"}</Text>
        </View>
        <View style={styles.authorContainer}>
          <FontAwesome name="calendar" size={21} style={styles.authorIcon} color="black" />
          <Text style={styles.dateAndAuthorText}>
            {blog?.timestamp
              ? dayjs(blog.timestamp).format("MMM D, YYYY h:mm A")
              : "Recently updated"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default BlogHeader;
