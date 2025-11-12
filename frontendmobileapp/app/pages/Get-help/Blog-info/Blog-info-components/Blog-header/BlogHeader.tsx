
import { ScrollView, ImageBackground, Text, View } from "react-native";
import sharedStyles from "../../../GetHelpSharedStyles";
import styles from "./BlogHeaderStyles";
import { BlogPostModel } from "@/generated-api";
import { useAppSelector } from '@/app/store/hooks';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import dayjs from "dayjs";


const BlogHeader = () => {
  const blog: BlogPostModel = useAppSelector(state => state.navigation.tabStack.at(-1)?.data) as BlogPostModel;

  return (
    <ScrollView contentContainerStyle={sharedStyles.contentContainer} style={styles.indBlogContainer}>
      <Text style={styles.indBlogTitle}>{blog.title}</Text>
      <ImageBackground style={styles.blogImage} source={blog.image_url}></ImageBackground>
      <View style={styles.indAuthorAndDateContainer}>
        <View style={styles.authorContainer}>
          <Ionicons name="person-sharp" size={21} style={styles.authorIcon} color="black" />
          <Text style={styles.dateAndAuthorText}>{blog.author}</Text>
        </View>
        <View style={styles.authorContainer}>
          <FontAwesome name="calendar" size={21} style={styles.authorIcon} color="black" />
          <Text style={styles.dateAndAuthorText}>{dayjs(blog?.timestamp).format('MMM D, YYYY h:mm A')}</Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default BlogHeader