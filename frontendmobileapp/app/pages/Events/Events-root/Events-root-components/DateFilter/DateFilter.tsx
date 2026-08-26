import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  Button,
  Platform,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Styles from "./DateFilterDropdownStyles";

interface DateRange {
  startDate?: string;
  endDate?: string;
}

interface Props {
  onSearch: (dates: DateRange) => void;
  showTrigger?: boolean;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  initialDates?: DateRange;
}

const DateFilterDropdown = ({
  onSearch,
  showTrigger = true,
  visible,
  onVisibleChange,
  initialDates,
}: Props) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const isVisible = typeof visible === "boolean" ? visible : internalVisible;

  const setVisibility = (nextVisible: boolean) => {
    if (typeof visible !== "boolean") {
      setInternalVisible(nextVisible);
    }
    onVisibleChange?.(nextVisible);
  };

  React.useEffect(() => {
    if (!initialDates) {
      setStartDate(null);
      setEndDate(null);
      return;
    }

    setStartDate(initialDates.startDate ? new Date(initialDates.startDate) : null);
    setEndDate(initialDates.endDate ? new Date(initialDates.endDate) : null);
  }, [initialDates?.endDate, initialDates?.startDate]);

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const handleSearch = () => {
    if (startDate && endDate && endDate < startDate) {
      Alert.alert("Invalid date range", "End date cannot be before start date.");
      return;
    }

    setVisibility(false);
    onSearch({
      startDate: startDate ? formatDate(startDate) : undefined,
      endDate: endDate ? formatDate(endDate) : undefined,
    });
  };

  return (
    <View style={Styles.filterRow}>
      {/* Dropdown toggle */}
      {showTrigger && (
        <TouchableOpacity
          onPress={() => setVisibility(!isVisible)}
          style={Styles.dropdownToggle}
          accessibilityRole="button"
          accessibilityLabel="Filter by date"
          accessibilityState={{ expanded: isVisible }}
        >
          <Text style={Styles.dropdownToggleText}>Filter by Date ▼</Text>
        </TouchableOpacity>
      )}

      {/* Dropdown modal */}
      <Modal visible={isVisible} transparent animationType="fade">
        <View style={Styles.modalOverlay}>
          <View style={Styles.modalContainer}>
            {/* START DATE */}
            <Text style={Styles.labelText}>Start Date</Text>

            {Platform.OS === "web" ? (
              // Use simple text input for web
              <TextInput
                placeholder="YYYY-MM-DD"
                value={startDate ? formatDate(startDate) : ""}
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
                accessibilityRole="button"
                accessibilityLabel={
                  startDate ? `Start date ${formatDate(startDate)}` : "Select start date"
                }
              >
                <Text>{startDate ? formatDate(startDate) : "Select Start Date"}</Text>
              </TouchableOpacity>
            )}

            {/* END DATE */}
            <Text style={Styles.labelText}>End Date</Text>

            {Platform.OS === "web" ? (
              //  Use simple text input for web
              <TextInput
                placeholder="YYYY-MM-DD"
                value={endDate ? formatDate(endDate) : ""}
                onChangeText={(text) => {
                  const parsed = new Date(text);
                  if (!isNaN(parsed.getTime())) {
                    if (startDate && parsed < startDate) {
                      Alert.alert("Invalid date range", "End date cannot be before start date.");
                      return;
                    }
                    setEndDate(parsed);
                  }
                }}
                style={Styles.inputWithMargin}
              />
            ) : (
              // Native picker for mobile
              <TouchableOpacity
                onPress={() => setShowEndPicker(true)}
                style={Styles.inputWithMargin}
                accessibilityRole="button"
                accessibilityLabel={endDate ? `End date ${formatDate(endDate)}` : "Select end date"}
              >
                <Text>{endDate ? formatDate(endDate) : "Select End Date"}</Text>
              </TouchableOpacity>
            )}

            {/* Buttons */}
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Button
                style={Styles.cancelButton}
                title="Cancel"
                onPress={() => setVisibility(false)}
              />
              <Button title="Search" onPress={handleSearch} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Native pickers only (hidden on web) */}
      {Platform.OS !== "web" && showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      {Platform.OS !== "web" && showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e, date) => {
            setShowEndPicker(false);
            if (date) {
              if (startDate && date < startDate) {
                Alert.alert("Invalid date range", "End date cannot be before start date.");
                return;
              }
              setEndDate(date);
            }
          }}
        />
      )}
    </View>
  );
};

export default DateFilterDropdown;
