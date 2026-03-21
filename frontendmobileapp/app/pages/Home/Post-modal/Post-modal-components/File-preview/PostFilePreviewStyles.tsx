import { StyleSheet, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
  previewContainer: {
    position: 'relative',
    marginRight: 8,
  },
  previewImage: {
    borderRadius: 12,
  },
  previewVideo: {
    borderRadius: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  overlayText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  text: {
    textAlign: 'center',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#000',
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeText: {
    color: '#fff',
    textAlign: 'center',
  },
  deleteWrapper: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  deleteIcon: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  fileName: {
    marginTop: 4,
    fontSize: 12,
    color: '#555',
    width: SCREEN_WIDTH * 0.3,
    textAlign: 'center',
  },
  arrowWrapper: {
    position: 'absolute',
    top: '45%',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  navButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pageIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default styles;
