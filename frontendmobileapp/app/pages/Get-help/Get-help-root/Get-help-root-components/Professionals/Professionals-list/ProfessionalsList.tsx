import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import styles from "./ProfessionalsListStyles";
import { getImageSource } from "@/constants/imageFallbacks";
import ListStateView from "@/app/Universal-components/List-state/ListStateView";
import { fetchProfessionals } from "@/app/store/Get-help-store/getHelpSlice";

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
  const [expanded, setExpanded] = useState<number | null>(null);

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
            <Image
              style={styles.profileImage}
              source={getImageSource(professional?.profile_pic, "profile")}
            />
            <Text style={styles.professionalProfileName}>{professional?.username}</Text>
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
