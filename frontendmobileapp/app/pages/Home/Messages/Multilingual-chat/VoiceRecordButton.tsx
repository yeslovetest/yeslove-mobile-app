import React, { useEffect, useState } from "react";
import { TouchableOpacity, Text, View, StyleSheet, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  getRecordingPermissionsAsync,
  setAudioModeAsync,
} from "expo-audio";
import { theme } from "@/app/theme";

const formatDuration = (millis: number): string => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const VoiceRecordButton = ({
  onRecorded,
  disabled,
}: {
  onRecorded: (uri: string) => void;
  disabled?: boolean;
}) => {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    void setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
  }, []);

  const ensurePermission = async (): Promise<boolean> => {
    const current = await getRecordingPermissionsAsync();
    if (current.granted) return true;

    const requested = await requestRecordingPermissionsAsync();
    if (!requested.granted) {
      Alert.alert(
        "Microphone access needed",
        "Please allow microphone access in Settings to send voice messages.",
      );
      return false;
    }
    return true;
  };

  const handlePress = async () => {
    if (disabled || preparing) return;

    if (recorderState.isRecording) {
      await recorder.stop();
      if (recorder.uri) {
        onRecorded(recorder.uri);
      }
      return;
    }

    setPreparing(true);
    try {
      const granted = await ensurePermission();
      if (!granted) return;

      await recorder.prepareToRecordAsync();
      recorder.record();
    } finally {
      setPreparing(false);
    }
  };

  const isRecording = recorderState.isRecording;

  return (
    <View style={styles.container}>
      {isRecording && (
        <Text style={styles.durationText}>{formatDuration(recorderState.durationMillis)}</Text>
      )}
      <TouchableOpacity
        style={[styles.button, isRecording && styles.buttonRecording]}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={isRecording ? "Stop recording" : "Record a voice message"}
      >
        <Ionicons
          name={isRecording ? "stop" : "mic"}
          size={20}
          color={theme.colors.textOnPrimary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    marginRight: theme.spacing.xs,
    fontSize: 12,
    color: theme.colors.danger,
    fontVariant: ["tabular-nums"],
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  buttonRecording: {
    backgroundColor: theme.colors.danger,
  },
});

export default VoiceRecordButton;
