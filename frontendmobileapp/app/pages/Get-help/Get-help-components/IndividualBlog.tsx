import { ScrollView, ImageBackground } from "react-native";
import styles from '@/app/pages/Get-help/Get-help-styles/GetHelpStyles';
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
