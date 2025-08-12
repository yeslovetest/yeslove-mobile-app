
import React from 'react'
import { ImageBackground, View, Text } from 'react-native'
import styles from '@/Styles/component-styles/OrangeBannerStyles';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export interface Props{
    mainTitle: string;
    description: string;
    icon: string
}


const OrangeBanner = (props:Props) => {
  return (
            <View>
            <View style={styles.ourProfessionalsContainer}>
                <ImageBackground
                    style={styles.imageBackground}
                    source={{ uri: "https://yeslove.co.uk/wp-content/uploads/2021/04/shape_7.png" }}
                    resizeMode="cover"
                />
                <View style={styles.contentRow}>
                    <FontAwesome6 name={props.icon} size={40} color="white" />

                    <View style={styles.textContainer}>
                        <Text style={styles.ourProfessionalsText}>{props.mainTitle}</Text>
                        <Text style={styles.ourProfessionalsCaption}>{props.description}</Text>
                    </View>
                </View>
            </View>
        </View>
  )
}

export default OrangeBanner
