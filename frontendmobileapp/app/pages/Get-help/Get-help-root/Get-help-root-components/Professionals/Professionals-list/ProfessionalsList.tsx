import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import styles from "./ProfessionalsListStyles";
import { getImageSource } from "@/constants/imageFallbacks";
import type { ProfessionalResponse } from "@/generated-api";
import ListStateView from "@/app/Universal-components/List-state/ListStateView";
import { fetchProfessionals } from "@/app/store/Get-help-store/getHelpSlice";
import { fetchChatMessages } from "@/app/store/Chat/chatSlice";
import { openTabOnTopAction, TabType } from "@/app/store/Navigation/navigationSlice";

const ProfessionalsList = () => {
  const professionals = useAppSelector((state) => state.getHelp.professionals);
  const searchQuery = useAppSelector((state) => state.getHelp.currentSearchQuery);
  const dispatch = useAppDispatch();
  const {
    professionalsLoading,
    professionalsError,
    professionalPage,
    professionalsPerPage,
    totalProfessionals,
  } = useAppSelector((state) => state.getHelp);
  const loadPage = (page: number) =>
    dispatch(
      fetchProfessionals({ currentPage: page, perPage: professionalsPerPage, search: searchQuery }),
    );
  const currentUserId = useAppSelector((state) => state.user?.id);
  const [expanded, setExpanded] = useState<number | null>(null);

  // Only a professional an admin has linked to an app account has a keycloak_id, so only they
  // can be messaged. The others are shown without a Message button.
  const canMessage = (professional: ProfessionalResponse) =>
    !!professional.keycloak_id && professional.keycloak_id !== currentUserId;

  const messageProfessional = (professional: ProfessionalResponse) => {
    if (!professional.keycloak_id) return;
    dispatch(fetchChatMessages(professional.keycloak_id));
    dispatch(
      openTabOnTopAction({
        type: TabType.CONVERSATION,
        data: {
          userId: professional.keycloak_id,
          profile_pic: professional.profile_pic ?? "",
          username: professional.username,
        },
      }),
    );
  };

  const handleToggle = (index: number) => {
    setExpanded(expanded === index ? null : index); // Toggle the expansion
  };

  return (
    <View>
      {!!professionalsError && (
        <View accessibilityRole="alert">
          <Text>{professionalsError}</Text>
          <TouchableOpacity accessibilityRole="button" onPress={() => loadPage(professionalPage)}>
            <Text>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      {professionalsLoading && (
        <ListStateView loading loadingText="Loading professionals..." emptyText="" />
      )}
      {!professionalsLoading &&
        !professionalsError &&
        professionals.map((professional, index) => (
          <View key={index} style={styles.professionalProfileContainer}>
            <TouchableOpacity
              disabled={!canMessage(professional)}
              onPress={() => messageProfessional(professional)}
              accessibilityRole={canMessage(professional) ? "button" : undefined}
              accessibilityLabel={
                canMessage(professional) ? `Open chat with ${professional?.username}` : undefined
              }
              style={{ alignItems: "center" }}
            >
              <Image
                accessible={false}
                style={styles.profileImage}
                source={getImageSource(professional?.profile_pic, "profile")}
              />
              <Text style={styles.professionalProfileName}>{professional?.username}</Text>
            </TouchableOpacity>
            <Text style={styles.professionalDescription}>
              {expanded === index
                ? professional?.bio
                : `${(professional?.bio ?? "").substring(0, 300)}${(professional?.bio?.length ?? 0) > 300 ? "..." : ""}`}
            </Text>
            {(professional?.bio?.length ?? 0) > 300 && (
              <TouchableOpacity
                accessibilityRole="button"
                style={styles.viewProfile}
                onPress={() => handleToggle(index)}
              >
                <Text style={styles.buttonText}>
                  {expanded === index ? "Read less" : "Read more"}
                </Text>
              </TouchableOpacity>
            )}
            {canMessage(professional) ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Message ${professional?.username}`}
                style={styles.viewProfile}
                onPress={() => messageProfessional(professional)}
              >
                <Text style={styles.buttonText}>Message</Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ textAlign: "center", opacity: 0.6, marginTop: 10 }}>
                Messaging isn&apos;t available for this professional yet.
              </Text>
            )}
          </View>
        ))}
      {!professionalsLoading && !professionalsError && professionals.length === 0 && (
        <ListStateView
          loading={false}
          loadingText="Loading professionals..."
          emptyText={
            searchQuery
              ? `No professionals found for "${searchQuery}".`
              : "No professionals available yet."
          }
        />
      )}
      {!professionalsLoading && !professionalsError && (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {professionalPage > 1 && (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => loadPage(professionalPage - 1)}
            >
              <Text>Previous</Text>
            </TouchableOpacity>
          )}
          {professionalPage * professionalsPerPage < totalProfessionals && (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => loadPage(professionalPage + 1)}
            >
              <Text>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default ProfessionalsList;
