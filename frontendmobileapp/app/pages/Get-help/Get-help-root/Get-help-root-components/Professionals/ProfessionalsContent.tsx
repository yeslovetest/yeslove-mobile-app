import React from 'react'
import { View } from 'react-native'
import GetHelpProfessionals from './Professionals-list/ProfessionalsList'
import GetHelpSearchBar from '../Get-help-search-bar/GetHelpSearchBar'

const ProfessionalsContent = () => {
  return (
    <View>
      <GetHelpSearchBar placeholder="Search professionals..." />
      <GetHelpProfessionals />
    </View>
  )
}

export default ProfessionalsContent
