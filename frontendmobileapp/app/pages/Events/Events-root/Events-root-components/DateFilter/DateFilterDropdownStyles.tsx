import theme from "@/assets/variables/Variables";
import { StyleSheet } from "react-native";


const Styles = StyleSheet.create({
  filterRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  dropdownToggle: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  dropdownToggleText: {
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: theme.colors.mainBkgColor,
    padding: 20,
    borderRadius: 12,
    width: '85%',
  },
  labelText: {
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  inputWithMargin: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: 'grey', 
  },
});

export default Styles;
