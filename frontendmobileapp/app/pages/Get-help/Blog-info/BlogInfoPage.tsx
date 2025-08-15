import { ScrollView } from "react-native";
import sharedStyles from "../GetHelpSharedStyles";
import styles from "./BlogInfoPageStyles";
import BlogContent from "./Blog-info-components/Blog-text/BlogText";
import BlogTitle from "./Blog-info-components/Blog-header/BlogHeader";
import Header from "@/app/Universal-components/Header/Header";


const BlogInfoPage = () => {
    return (
        <>
        <Header></Header>
        <ScrollView contentContainerStyle={sharedStyles.contentContainer} style={styles.indBlogContainer}>
            <BlogTitle />
            <BlogContent />
        </ScrollView>
</>        
    )
}

export default BlogInfoPage
