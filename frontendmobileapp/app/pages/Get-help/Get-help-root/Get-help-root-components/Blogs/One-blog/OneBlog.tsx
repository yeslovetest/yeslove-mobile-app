import { View, ImageBackground, Text } from "react-native";
import styles from "./OneBlogStyles";
import blogPlaceholders, { Blog } from "../Blogs-list/PlaceholderBlogs"
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppDispatch } from "@/app/store/hooks"
import { openTabOnTopAction, TabType } from "@/app/store/Navigation/navigationSlice"
import { BlogPostModel } from "@/generated-api";


export interface Props {
    blog: BlogPostModel
}

const OneBlog = (props: Props) => {

    const dispatch = useAppDispatch()

    const handleBlogClick = () => {
        dispatch(openTabOnTopAction({ type: TabType.INDIVIDUAL_BLOG, data: props.blog }))
    }

    return (
        <View style={styles.blogContainer}>
            <ImageBackground style={[styles.blogImage, {
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                overflow: 'hidden'
            }]} source={props.blog?.image_url ?? '../../assets/images/blogimg2.png'}></ImageBackground>
            <Text onPress={handleBlogClick} style={styles.blogTitle}>{props.blog?.title}</Text>
            <View style={styles.authorAndDateContainer}>
                <View style={styles.authorContainer}>
                    <Ionicons name="person-sharp" size={21} style={styles.authorIcon} color="black" />
                    <Text style={styles.dateAndAuthorText}>{props.blog?.author}</Text>
                </View>
                <View style={styles.authorContainer}>
                    <FontAwesome name="calendar" size={21} style={styles.authorIcon} color="black" />
                    <Text style={styles.dateAndAuthorText}>{props.blog?.timestamp}</Text>
                </View>
            </View>
            <Text style={styles.blogSummary}>{props.blog?.summary ?? ''}</Text>
        </View>
    )
}

export default OneBlog
