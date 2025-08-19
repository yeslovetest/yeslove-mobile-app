import { View, ImageBackground, Text } from "react-native";
import styles from "@/Styles/page-styles/GetHelpStyles";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const BlogsHeader = () => {
    return (
        <View>
            <View style={styles.ourProfessionalsContainer}>
                <ImageBackground
                    style={styles.imageBackground}
                    source={{ uri: "https://yeslove.co.uk/wp-content/uploads/2021/04/shape_7.png" }}
                    resizeMode="cover"
                />
                <View style={styles.contentRow}>
                    <MaterialCommunityIcons name="bookshelf" size={48} color="white" />

                    <View style={styles.textContainer}>
                        <Text style={styles.ourProfessionalsText}>Our Blogs</Text>
                        <Text style={styles.ourProfessionalsCaption}>Browse the list of our blogs</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default BlogsHeader
