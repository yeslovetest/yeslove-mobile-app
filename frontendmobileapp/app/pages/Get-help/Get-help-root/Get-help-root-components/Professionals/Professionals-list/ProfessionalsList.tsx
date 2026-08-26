import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useAppSelector } from "@/app/store/hooks";
import styles from "./ProfessionalsListStyles";
import { getImageSource } from "@/constants/imageFallbacks";
import ListStateView from "@/app/Universal-components/List-state/ListStateView";
import { useSettleAfter } from "@/app/Universal-components/List-state/useSettleAfter";

const ProfessionalsList = () => {
  const professionals = useAppSelector((state) => state.getHelp.professionals);
  const searchQuery = useAppSelector((state) => state.getHelp.currentSearchQuery);
  const settled = useSettleAfter();
  const [expanded, setExpanded] = useState(null);

  const handleToggle = (index) => {
    setExpanded(expanded === index ? null : index); // Toggle the expansion
  };

  return (
    <View>
      {professionals.map((professional, index) => (
        <View key={index} style={styles.professionalProfileContainer}>
          <Image
            style={styles.profileImage}
            source={getImageSource(professional?.profile_pic, "profile")}
          />
          <Text style={styles.professionalProfileName}>{professional?.username}</Text>
          <Text style={styles.professionalDescription}>
            {expanded === index ? professional?.bio : `${professional?.bio?.substring(0, 300)}...`}
          </Text>
          <TouchableOpacity onPress={() => handleToggle(index)}>
            <TouchableOpacity style={styles.viewProfile}>
              <Text style={styles.buttonText}>View Profile</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      ))}
      {professionals.length === 0 && (
        <ListStateView
          loading={!settled}
          loadingText="Loading professionals..."
          emptyText={
            searchQuery
              ? `No professionals found for "${searchQuery}".`
              : "No professionals available yet."
          }
        />
      )}
    </View>
  );
};

export default ProfessionalsList;
