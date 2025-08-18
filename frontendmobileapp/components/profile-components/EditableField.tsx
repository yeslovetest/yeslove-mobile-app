import React from 'react'
import { Text, View,TextInput } from 'react-native';
import styles from "../../Styles/page-styles/ProfileStyles";


function EditableField({ label, value, onChange }: {label: string, value: string, onChange: (text: string) => void}) {

  return (
    <View style={styles.editItemContainer}>
      <Text style={styles.editItemText}>{label}</Text>
      <TextInput style={styles.editItemInfo} value={value} onChangeText={(text) => {
        onChange(text);
      } } />
    </View>
  );
}

export default EditableField
