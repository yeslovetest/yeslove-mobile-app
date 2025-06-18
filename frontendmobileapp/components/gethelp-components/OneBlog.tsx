import { View, ImageBackground, Text } from "react-native";
import styles from "@/Styles/page-styles/GetHelpStyles";
import blogPlaceholders, { Blog } from "./placeholderBlogs";
import Ionicons from '@expo/vector-icons/Ionicons';

export interface Props {
    blog: Blog
}

const OneBlog = (props: Props) => {
    return (
        <View style={styles.blogContainer}>
            <ImageBackground style={[styles.blogImage, {
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                overflow: 'hidden'
            }]} source={props.blog.image}></ImageBackground>
            <Text style={styles.blogTitle}>{props.blog.title}</Text>
            <View style={styles.authorAndDateContainer}>
                <View style={styles.authorContainer}>
                <Ionicons name="person-sharp" size={24} style={styles.authorIcon} color="black" />
                <Text>{props.blog.author}</Text>
                </View>
                <Text>{props.blog.datePosted}</Text>
            </View>
        </View>
    )
}

export default OneBlog
