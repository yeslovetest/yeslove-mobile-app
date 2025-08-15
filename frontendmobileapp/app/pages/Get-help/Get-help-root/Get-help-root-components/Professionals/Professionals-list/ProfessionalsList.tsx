import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styles from './ProfessionalsListStyles';
import theme from "../../../../../../../assets/variables/Variables"
import PlaceholderProfessionals from './PlaceholderProfessionals';

const ProfessionalsList = () => {
  const [expanded, setExpanded] = useState(null); 


  const handleToggle = (index) => {
    setExpanded(expanded === index ? null : index); // Toggle the expansion
  };

  return (
    <View>
      {PlaceholderProfessionals.map((professional, index) => (
        <View key={index} style={styles.professionalProfileContainer}>
          <Image style={styles.profileImage} source={{ uri: professional.image }} />
          <Text style={styles.professionalProfileName}>{professional.name}</Text>
          <Text style={styles.professionalDescription}>
            {expanded === index ? professional.description : `${professional.description.substring(0, 300)}...`}
          </Text>
          <TouchableOpacity onPress={() => handleToggle(index)}>
            <Text style={{ color: theme.colors.primaryBlue , marginTop: 10 }}>
              {expanded === index ? 'See Less' : 'See More'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default ProfessionalsList
