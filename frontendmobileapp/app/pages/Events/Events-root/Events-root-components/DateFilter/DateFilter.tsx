import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Button,
  Platform,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Styles from './DateFilterDropdownStyles';

const DateFilterDropdown = ({ onSearch }) => {
  const [visible, setVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleSearch = () => {
    setVisible(false);
    onSearch({
      startDate: startDate ? formatDate(startDate) : undefined,
      endDate: endDate ? formatDate(endDate) : undefined,
    });
  };

  return (
    <View>
      {/* Dropdown toggle */}
      <TouchableOpacity
        onPress={() => setVisible(!visible)}
        style={Styles.dropdownToggle}
      >
        <Text style={Styles.dropdownToggleText}>Filter by Date ▼</Text>
      </TouchableOpacity>

      {/* Dropdown modal */}
      <Modal visible={visible} transparent animationType="fade">
        <View
          style={Styles.modalOverlay}
        >
          <View
            style={Styles.modalContainer}
          >
            {/* START DATE */}
            <Text style={Styles.labelText}>Start Date</Text>

            {Platform.OS === 'web' ? (
              // Use simple text input for web
              <TextInput
                placeholder="YYYY-MM-DD"
                value={startDate ? formatDate(startDate) : ''}
                onChangeText={(text) => {
                  const parsed = new Date(text);
                  if (!isNaN(parsed.getTime())) setStartDate(parsed);
                }}
                style={Styles.input}
              />
            ) : (
              // Native picker for iOS/Android
              <TouchableOpacity
                onPress={() => setShowStartPicker(true)}
                style={Styles.input}
              >
                <Text>{startDate ? formatDate(startDate) : 'Select Start Date'}</Text>
              </TouchableOpacity>
            )}

            {/* END DATE */}
            <Text style={Styles.labelText}>End Date</Text>

            {Platform.OS === 'web' ? (
              //  Use simple text input for web
              <TextInput
                placeholder="YYYY-MM-DD"
                value={endDate ? formatDate(endDate) : ''}
                onChangeText={(text) => {
                  const parsed = new Date(text);
                  if (!isNaN(parsed.getTime())) setEndDate(parsed);
                }}
                style={Styles.inputWithMargin}
              />
            ) : (
              // Native picker for mobile
              <TouchableOpacity
                onPress={() => setShowEndPicker(true)}
                style={Styles.inputWithMargin}
              >
                <Text>{endDate ? formatDate(endDate) : 'Select End Date'}</Text>
              </TouchableOpacity>
            )}

            {/* Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button style={Styles.cancelButton} title="Cancel" onPress={() => setVisible(false)} />
              <Button title="Search" onPress={handleSearch} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Native pickers only (hidden on web) */}
      {Platform.OS !== 'web' && showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      {Platform.OS !== 'web' && showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}
    </View>
  );
};

export default DateFilterDropdown;
