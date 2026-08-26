import React from "react";
import { View, Text, Image } from "react-native";
import styles from "./ChatResponseStyles";
import UserProfile from "../UserProfile/UserProfile";
import MediaFilePreview from "../MediaPreview/mediaPreview";
import { MediaFile } from "@/generated-api";

interface Props {
  text: string;
  time: string;
  profilePic: string;
  media: { uri: string; type: string; name?: string }[] | MediaFile[];
}

const ChatResponse = ({ text, time, profilePic, media }: Props) => {
  const responseText = (text ?? "").trim();

  return (
    <View style={styles.chatResponseContainer}>
      <UserProfile photo={profilePic} />
      <View style={styles.bubbleWrap}>
        <View style={styles.chatResponse}>
          <View style={styles.tailReceived} />
          <MediaFilePreview file={media} bubbleTone="received" maxPreviewWidth={168} />
          {responseText.length > 0 && <Text style={styles.responseText}>{responseText}</Text>}
          <Text style={styles.timeSentResponse}>{time}</Text>
        </View>
      </View>
    </View>
  );
};

export default ChatResponse;
