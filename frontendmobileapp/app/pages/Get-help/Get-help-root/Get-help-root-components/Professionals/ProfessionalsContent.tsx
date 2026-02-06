import React from 'react'
import { View } from 'react-native'
import GetHelpProfessionals from './Professionals-list/ProfessionalsList'
import GetHelpSearchBar from '../Get-help-search-bar/GetHelpSearchBar'
import { useAppDispatch } from '@/app/store/hooks'
import { useFocusEffect } from 'expo-router'
import { fetchProfessionals } from '@/app/store/Get-help-store/getHelpSlice'

const ProfessionalsContent = () => {

  const dispatch = useAppDispatch();

  useFocusEffect(React.useCallback(() => {
      dispatch(fetchProfessionals({}));
  }, []));

  return (
    <View style={{width: "100%"}}>
      <GetHelpSearchBar placeholder="Search professionals..."  currentSection='professionals'/>
      <GetHelpProfessionals />
    </View>
  )
}

export default ProfessionalsContent
