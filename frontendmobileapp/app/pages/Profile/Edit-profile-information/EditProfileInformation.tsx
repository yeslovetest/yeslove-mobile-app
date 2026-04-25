import React, { useEffect, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard, LayoutChangeEvent } from 'react-native'
import styles from './EditProfileInformationStyles'
import Header from '@/app/Universal-components/Header/Header'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { setProfileInformationAction, persistUserInfoAction, setActiveAboutTabAction } from '@/app/store/Profile-store/profileSlice'
import TextInputField from './TextInputField/TextInputField'
import { useMsgToggle } from "@/hooks/messageToggle";

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
  const msgToggle = useMsgToggle();

  const [editedName, setEditedName] = useState(name);
  const [editedEmail, setEditedEmail] = useState(email);
  const [editedPhone, setEditedPhone] = useState(phone);
  const [editedAddress, setEditedAddress] = useState(address);
  const [editedWebsite, setEditedWebsite] = useState(website);
  const [editedBio, setEditedBio] = useState(bio);
  const [displayMsg, setDisplayMsg] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const fieldPositionRef = useRef<Record<string, number>>({});

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
    // Update the profile data in the store (username and email direct update not allowed - KeyCloak)
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
    setDisplayMsg('Profile Update Successful!')
    dispatch(setActiveAboutTabAction("View"))
  }

  useEffect(() => {
    // make the message appear for 3s
    msgToggle.toggleMsg(displayMsg);
  }, [displayMsg, profileData]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates?.height ?? 0);
    });

    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  const handleFieldLayout = (label: string, event: LayoutChangeEvent) => {
    fieldPositionRef.current[label] = event.nativeEvent.layout.y;
  };

  const handleFieldFocus = (label: string) => {
    const targetY = Math.max(0, (fieldPositionRef.current[label] ?? 0) - 12);
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
    });
  };
  
  return (
    <>
      <Header></Header>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: Math.max(34, keyboardHeight + 24) },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.headerRow}>
            <Text style={styles.pageTitle}>Edit Profile</Text>
            <Text style={styles.pageSubtitle}>Update your contact details and bio information.</Text>
          </View>

          <TextInputField
            label="Name"
            value={editedName}
            onChange={(value: string) => handleFieldChange("Name", value)}
            onFocus={() => handleFieldFocus("Name")}
            onLayout={(event) => handleFieldLayout("Name", event)}
          />
          <TextInputField
            label="Bio"
            value={editedBio}
            onChange={(value: string) => handleFieldChange("Bio", value)}
            onFocus={() => handleFieldFocus("Bio")}
            onLayout={(event) => handleFieldLayout("Bio", event)}
          />
          <TextInputField
            label="Email"
            value={editedEmail}
            onChange={(value: string) => handleFieldChange("Email", value)}
            onFocus={() => handleFieldFocus("Email")}
            onLayout={(event) => handleFieldLayout("Email", event)}
          />
          <TextInputField
            label="Phone"
            value={editedPhone}
            onChange={(value: string) => handleFieldChange("Phone", value)}
            onFocus={() => handleFieldFocus("Phone")}
            onLayout={(event) => handleFieldLayout("Phone", event)}
          />
          <TextInputField
            label="Address"
            value={editedAddress}
            onChange={(value: string) => handleFieldChange("Address", value)}
            onFocus={() => handleFieldFocus("Address")}
            onLayout={(event) => handleFieldLayout("Address", event)}
          />
          <TextInputField
            label="Website"
            value={editedWebsite}
            onChange={(value: string) => handleFieldChange("Website", value)}
            onFocus={() => handleFieldFocus("Website")}
            onLayout={(event) => handleFieldLayout("Website", event)}
          />
          {msgToggle.msg && 
            <View style={styles.displayMsgBox}>
              <Text style={styles.displayMsgText}>{msgToggle.msg}</Text>
            </View>
          }
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}

export default EditProfileInformation
