import { ScrollView, ImageBackground } from "react-native";
import styles from '@/Styles/page-styles/GetHelpStyles';
import blogPlaceholders, { Blog } from "./placeholderBlogs";
import { useAppSelector } from '@/app/store/hooks';
import BlogContent from "./BlogContent";
import BlogTitle from "./BlogTitle";


const IndividualBlog = () => {
    return (
        <ScrollView contentContainerStyle={styles.contentContainer} style={styles.indBlogContainer}>
            <BlogTitle />
            <BlogContent />
        </ScrollView>
    )
}

export default IndividualBlog
