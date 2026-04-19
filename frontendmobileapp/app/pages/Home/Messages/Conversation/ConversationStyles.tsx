import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fafafa',
  },
  chatContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  contentContainer: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  mediaPreviewContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  inputDock: {
    justifyContent: "center",
    width: "100%",
    alignItems: "center",
    zIndex: 20,
  },
});

export default styles;
