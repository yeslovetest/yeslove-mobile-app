import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import styles from './ProfileInformationStyles'
import Header from '@/app/Universal-components/Header/Header'
import { useAppSelector } from '@/app/store/hooks'

const ProfileInformation = () => {
  const userId = useAppSelector(state => state.navigation.tabStack.at(-1)?.data?.userId);
  const name = useAppSelector(state => state.profile.profiles[userId].contact_info?.name ?? "");
  const email = useAppSelector(state => state.profile.profiles[userId].contact_info?.email ?? "");
  const phone = useAppSelector(state => state.profile.profiles[userId].contact_info?.phone ?? "");
  const address = useAppSelector(state => state.profile.profiles[userId].contact_info?.address ?? "");
  const website = useAppSelector(state => state.profile.profiles[userId].contact_info?.website ?? "");

  const profileFields = [
    { label: 'Name', value: name, icon: 'account-outline' as const },
    { label: 'Email', value: email, icon: 'email-outline' as const },
    { label: 'Phone', value: phone, icon: 'phone-outline' as const },
    { label: 'Address', value: address, icon: 'map-marker-outline' as const },
    { label: 'Website', value: website, icon: 'web' as const },
  ];

  return (
    <>
    <Header></Header>
    <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Text style={styles.pageTitle}>Profile Information</Text>
            <Text style={styles.pageSubtitle}>Your saved contact and account details.</Text>
          </View>

          <View style={{ gap: 12 }}>
            {profileFields.map((field) => (
              <View key={field.label} style={styles.viewItemContainer}>
                <View style={styles.fieldLabelRow}>
                  <View style={styles.fieldIconContainer}>
                    <MaterialCommunityIcons name={field.icon} size={16} style={styles.fieldIcon} />
                  </View>
                  <Text style={styles.viewItemText}>{field.label}</Text>
                </View>
                <Text style={styles.viewItemInfo}>{(field.value ?? '').trim() || 'Not provided'}</Text>
              </View>
            ))}
          </View>

        </ScrollView>  
    </View>
  </>
  )
}

export default ProfileInformation
