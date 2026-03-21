import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  profileImageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  profileBackgroundImage: {
    width: theme.spacing.postWidth,
    height: 340,
    display: "flex",
    justifyContent: "center",
    gap: 30,
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 15
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderStyle: "solid",
    borderColor: "#fff"
  },
  profileImageWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoBadge: {
    position: 'absolute',
    bottom: -14,
    alignSelf: 'center',
    backgroundColor: theme.colors.primaryBlue,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#fff',
  },
  changePhotoBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  previewActionsContainer: {
    width: '85%',
    marginTop: 6,
    alignItems: 'center',
  },
  previewMessage: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  previewButtonsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  previewButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 10,
  },
  previewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.primaryBlue,
  },
  cancelButtonText: {
    color: theme.colors.primaryBlue,
  },
  uploadButton: {
    backgroundColor: theme.colors.primaryBlue,
  },
  disabledButton: {
    opacity: 0.6,
  },
  validationMessage: {
    marginTop: 8,
    color: '#ffb4b4',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    width: '90%',
  },
  successMessage: {
    marginTop: 8,
    color: '#d0ffd7',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    width: '90%',
  },
  userName: {
   color: "#fff",
   fontSize: 20,
   fontWeight: '600'
  },
  userStatsContainer: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
  },
  userStats: {
    color: "#c5c5c5",
    fontSize: 20,
    marginLeft: 10,
    marginRight: 10
  },
  userStatsNumber: {
    fontWeight: '600',
    color: "#fff"
  },
userBioContainer:{
  width: "100%",
  height: 80,
  marginTop: 20,
  borderRadius: 10,
  backgroundColor: "#fff",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  padding: 13,
},
userBioText: {
  color: "#000"
},
})

export default styles