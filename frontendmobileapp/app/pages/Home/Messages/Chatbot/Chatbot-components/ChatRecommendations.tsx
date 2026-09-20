import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Linking } from "react-native";
import styles from "../SharedChatbotStyles";
import { getImageSource } from "@/constants/imageFallbacks";
import type { ChatRecommendation } from "@/chatbot-client-api/api";

const openRecommendation = async (url: string): Promise<void> => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  } catch {
    // Ignore link open failures to keep chat interaction uninterrupted.
  }
};

const typeLabel = (type: string): string => (type === "video_podcast" ? "Video" : "Article");

const ChatRecommendations = ({
  recommendations,
}: {
  recommendations: ChatRecommendation[];
}) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <View style={styles.recommendationsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recommendationsScrollContent}
      >
        {recommendations.map((item, index) => (
          <TouchableOpacity
            key={`${item.url}-${index}`}
            style={styles.recommendationCard}
            onPress={() => {
              void openRecommendation(item.url);
            }}
            accessibilityRole="link"
            accessibilityLabel={`${typeLabel(item.type)}: ${item.title}`}
          >
            <Image
              source={getImageSource(item.thumbnail_url ?? item.image_url ?? undefined, "generic")}
              style={styles.recommendationImage}
              resizeMode="cover"
            />
            <View style={styles.recommendationBody}>
              <Text style={styles.recommendationType}>{typeLabel(item.type)}</Text>
              <Text style={styles.recommendationTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {!!item.summary && (
                <Text style={styles.recommendationSummary} numberOfLines={2}>
                  {item.summary}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default ChatRecommendations;
