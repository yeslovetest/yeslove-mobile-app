import React, { useState } from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { theme } from "@/app/theme";

// No native audio module is installed in this project, so playback is done
// via an off-screen WebView playing a data: URI through HTML5 <audio> -
// react-native-webview is already a linked native dependency, avoiding the
// need to add and rebuild for expo-audio/expo-av just for this.
const AudioPlayer = ({ audioBase64 }: { audioBase64: string }) => {
  const [playKey, setPlayKey] = useState(0);
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    setPlaying(true);
    setPlayKey((key) => key + 1);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePlay}
        accessibilityRole="button"
        accessibilityLabel="Play voice response"
      >
        <Text style={styles.buttonText}>{playing ? "🔊 Playing…" : "▶ Play voice"}</Text>
      </TouchableOpacity>

      {playing && (
        <View style={styles.hiddenWebView}>
          <WebView
            key={playKey}
            originWhitelist={["*"]}
            source={{
              html: `<html><body style="margin:0"><audio autoplay src="data:audio/wav;base64,${audioBase64}" onended="window.ReactNativeWebView.postMessage('ended')"></audio></body></html>`,
            }}
            onMessage={() => setPlaying(false)}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: theme.spacing.sm,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radii.xxl,
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  hiddenWebView: {
    width: 1,
    height: 1,
    opacity: 0,
  },
});

export default AudioPlayer;
