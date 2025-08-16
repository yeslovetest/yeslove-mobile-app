import { ScrollView, ImageBackground, Text, View } from "react-native";
import styles from '@/Styles/page-styles/GetHelpStyles';
import { useAppSelector } from '@/app/store/hooks';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BlogPost } from "@/generated-api";


const BlogTitle = () => {
   const blog: BlogPost = useAppSelector(state => state.navigation.tabStack.at(-1)?.data) as BlogPost;
  return (
    <ScrollView contentContainerStyle={styles.contentContainer} style={styles.indBlogContainer}>
      <Text style={styles.indBlogTitle}>{blog.title}</Text>
      <ImageBackground style={styles.blogImage} source={blog.image_url ?? '../../assets/images/blogimg2.png'}></ImageBackground>
      <View style={styles.indAuthorAndDateContainer}>
                      <View style={styles.authorContainer}>
                          <Ionicons name="person-sharp" size={21} style={styles.authorIcon} color="black" />
                          <Text style={styles.dateAndAuthorText}>{blog.author}</Text>
                      </View>
                      <View style={styles.authorContainer}>
                          <FontAwesome name="calendar" size={21} style={styles.authorIcon} color="black" />
                          <Text style={styles.dateAndAuthorText}>{blog.timestamp}</Text>
                      </View>
                  </View>
    </ScrollView>
  )
}

export default BlogTitle