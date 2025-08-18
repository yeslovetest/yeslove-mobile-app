import React, { useState, useEffect } from 'react'
import { Text, View, Image, TouchableOpacity } from 'react-native';
import styles from "../../Styles/page-styles/ProfileStyles";
import EditableField from "./EditableField";
import {setActiveAboutTabAction, persistUserInfoAction, setProfileInformationAction } from "../../app/store/profileSlice";
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';


const AboutSection = () => {

  const userId = useAppSelector(state => state.navigation.tabStack.at(-1)?.data?.userId);
  const profileData = useAppSelector(state => state.profile.profiles[userId]);
  const name = useAppSelector(state => state.profile.profiles[userId].contact_info?.name ?? "");
  const email = useAppSelector(state => state.profile.profiles[userId].contact_info?.email ?? "");
  const phone = useAppSelector(state => state.profile.profiles[userId].contact_info?.phone ?? "");
  const address = useAppSelector(state => state.profile.profiles[userId].contact_info?.address ?? "");
  const website = useAppSelector(state => state.profile.profiles[userId].contact_info?.website ?? "");
  const bio = useAppSelector(state => state.profile.profiles[userId].bio ?? "");
  const activeAboutTab = useAppSelector(state => state.profile.view.activeAboutTab);
  const dispatch = useAppDispatch();
  const isOwnProfile = useAppSelector(state => userId === state.user.id);
  const aboutItems = ["View", "Edit"];


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
    <View>
      {/* About Navbar */}
      {isOwnProfile && (
        <View style={styles.aboutNavBarContainer}>
          <View style={styles.aboutNavBar}>
            {aboutItems.map((tab) => (
              <TouchableOpacity key={tab} style={[styles.aboutItem, activeAboutTab === tab && styles.activeAboutItem]} 
              onPress={() => dispatch(setActiveAboutTabAction(tab))}>
                <Text style={[styles.navText, activeAboutTab === tab && styles.activeAboutNavText]}>{tab}</Text>
                {activeAboutTab === tab && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Content */}
      {activeAboutTab === "View" && (
        <View>
          <View style={styles.viewItemContainer}>
            <Text style={styles.viewItemText}>Name</Text>
            <Text style={styles.viewItemInfo}>{name}</Text>
          </View>

          <View style={styles.viewItemContainer}>
            <Text style={styles.viewItemText}>Email</Text>
            <Text style={styles.viewItemInfo}>{email}</Text>
          </View>

          <View style={styles.viewItemContainer}>
            <Text style={styles.viewItemText}>Phone</Text>
            <Text style={styles.viewItemInfo}>{phone}</Text>
          </View>

          <View style={styles.viewItemContainer}>
            <Text style={styles.viewItemText}>Address</Text>
            <Text style={styles.viewItemInfo}>{address}</Text>
          </View>

          <View style={styles.viewItemContainer}>
            <Text style={styles.viewItemText}>Website</Text>
            <Text style={styles.viewItemInfo}>{website}</Text>
          </View>

          {/* Friends section */}
          <View style={styles.friendsContainer}>
            <View style={styles.friends}>
              <View style={styles.friendsItem}>
                <Text style={styles.activeFriendsText}>
                  My Friends
                </Text>
                <View style={styles.activeIndicator} />
              </View>

              {/* Friends */}
              <View style={styles.friend}>
                <Image
                  source={{ uri: "https://yeslove.co.uk/wp-content/themes/cirkle/assets/img/avatar/bp-avatar.png" }}
                  style={styles.friendImage}
                />
                <Text style={styles.friendName}>Friend username</Text>
              </View>
            </View>
          </View>
        </View>
      )}



      {activeAboutTab === "Edit" && (
        <View>
          <EditableField label="Name" value={editedName} onChange={(value: string) => handleFieldChange("Name", value)} />
          <EditableField label="Bio" value={editedBio} onChange={(value: string) => handleFieldChange("Bio", value)} />
          <EditableField label="Email" value={editedEmail} onChange={(value: string) => handleFieldChange("Email", value)} />
          <EditableField label="Phone" value={editedPhone} onChange={(value: string) => handleFieldChange("Phone", value)} />
          <EditableField label="Address" value={editedAddress} onChange={(value: string) => handleFieldChange("Address", value)} />
          <EditableField label="Website" value={editedWebsite} onChange={(value: string) => handleFieldChange("Website", value)} />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  )
}

export default AboutSection
