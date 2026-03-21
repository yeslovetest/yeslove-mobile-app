import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: "white",
    width: "100%",
    height: "92%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  exitHeader: {
    width: "100%",
    paddingHorizontal: 2,
    minHeight: 52,
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    gap: 8,
  },
  closeIcon: {
    padding: 2,
  },
  createPost: {
    color: theme.colors.blackText,
    fontSize: 19,
    fontWeight: "600",
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 1,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  actionButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f3f6fb',
    borderRadius: 8,
    minHeight: 36,

  },
  actionButtonsText : {
    textAlign: 'center',
    fontWeight: '600',
    color: theme.colors.primaryBlue,
    fontSize: 12
  },
  modalBody: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  
});

export default styles;
