import { ScrollView, ImageBackground } from "react-native";
import styles from '@/Styles/page-styles/GetHelpStyles';
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
