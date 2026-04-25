import React from 'react'
import { LayoutChangeEvent, Text, View,TextInput } from 'react-native';
import styles from './TextInputFieldStyles';


function TextInputField({
  label,
  value,
  onChange,
  onFocus,
  onLayout,
}: {
  label: string,
  value: string,
  onChange: (text: string) => void,
  onFocus?: () => void,
  onLayout?: (event: LayoutChangeEvent) => void,
}) {
  const isMultilineField = label === 'Bio';

  return (
    <View style={styles.editItemContainer} onLayout={onLayout}>
      <Text style={styles.editItemText}>{label}</Text>
      <TextInput
        style={[styles.editItemInfo, isMultilineField && styles.editItemInfoMultiline]}
        value={value}
        multiline={isMultilineField}
        onFocus={onFocus}
        onChangeText={(text) => {
          onChange(text);
        }}
      />
    </View>
  );
}

export default TextInputField