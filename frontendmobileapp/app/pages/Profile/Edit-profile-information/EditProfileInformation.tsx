import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import styles from './EditProfileInformationStyles'
import Header from '@/app/Universal-components/Header/Header'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { setProfileInformationAction, persistUserInfoAction, setActiveAboutTabAction } from '@/app/store/Profile-store/profileSlice'
import TextInputField from './TextInputField/TextInputField'

const EditProfileInformation = () => {
  const dispatch = useAppDispatch()
  const userId = useAppSelector(state => state.navigation.tabStack.at(-1)?.data?.userId);
  const profileData = useAppSelector(state => state.profile.profiles[userId]);
  const name = useAppSelector(state => state.profile.profiles[userId].contact_info?.name ?? "");
  const email = useAppSelector(state => state.profile.profiles[userId].contact_info?.email ?? "");
  const phone = useAppSelector(state => state.profile.profiles[userId].contact_info?.phone ?? "");
  const address = useAppSelector(state => state.profile.profiles[userId].contact_info?.address ?? "");
  const website = useAppSelector(state => state.profile.profiles[userId].contact_info?.website ?? "");
  const bio = useAppSelector(state => state.profile.profiles[userId].bio ?? "");

  const [editedName, setEditedName] = useState(name);
  const [editedEmail, setEditedEmail] = useState(email);
  const [editedPhone, setEditedPhone] = useState(phone);
  const [editedAddress, setEditedAddress] = useState(address);
  const [editedWebsite, setEditedWebsite] = useState(website);
  const [editedBio, setEditedBio] = useState(bio);

  useEffect(() => {
    setEditedName(name);
    setEditedEmail(email);
    setEditedPhone(phone);
    setEditedAddress(address);
    setEditedWebsite(website);
    setEditedBio(bio)
  }, [name, email, phone, address, website, bio]);

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case "Name":
        setEditedName(value);
        break;
      case "Email":
        setEditedEmail(value);
        break;
      case "Phone":
        setEditedPhone(value);
        break;
      case "Address":
        setEditedAddress(value);
        break;
      case "Website":
        setEditedWebsite(value);
        break;
      case "Bio":
        setEditedBio(value);
        break;
      default:
        break;
    }
  };

  const handleSave = () => {
    // Update the profile data in the store
    let updatedProfile = {
      ...profileData,
      contact_info: {
        ...profileData.contact_info,
        name: editedName,
        email: editedEmail,
        phone: editedPhone,
        address: editedAddress,
        website: editedWebsite
      },
      bio: editedBio
    };
    dispatch(setProfileInformationAction({ id: userId, data: updatedProfile }));
    dispatch(persistUserInfoAction());

    dispatch(setActiveAboutTabAction("View"))
  }
  return (
    <>
      <Header></Header>
      <View style={styles.container}>
        <ScrollView>
          <TextInputField label="Name" value={editedName} onChange={(value: string) => handleFieldChange("Name", value)} />
          <TextInputField label="Bio" value={editedBio} onChange={(value: string) => handleFieldChange("Bio", value)} />
          <TextInputField label="Email" value={editedEmail} onChange={(value: string) => handleFieldChange("Email", value)} />
          <TextInputField label="Phone" value={editedPhone} onChange={(value: string) => handleFieldChange("Phone", value)} />
          <TextInputField label="Address" value={editedAddress} onChange={(value: string) => handleFieldChange("Address", value)} />
          <TextInputField label="Website" value={editedWebsite} onChange={(value: string) => handleFieldChange("Website", value)} />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  )
}

export default EditProfileInformation
