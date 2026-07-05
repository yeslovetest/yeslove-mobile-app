import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "./DetailsStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { openTabOnTopAction, TabType } from "@/app/store/Navigation/navigationSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";

const Details = () => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.user.id);

  const openProfileInformation = () => {
    dispatch(openTabOnTopAction({ type: TabType.PROFILE_INFORMATION, data: { userId: userId } }));
  };

  const openEditProfileInformation = () => {
    dispatch(
      openTabOnTopAction({ type: TabType.EDIT_PROFILE_INFORMATION, data: { userId: userId } }),
    );
  };
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.detailsText}>Details</Text>
        <TouchableOpacity style={styles.iconContainer} onPress={openProfileInformation}>
          <Ionicons name="information-circle-outline" size={24} style={styles.icon} />
          <Text style={styles.viewInformationText}>View about profile information</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={openEditProfileInformation} style={styles.button}>
          <Text style={styles.buttonText}>Edit your profile information</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default Details;
