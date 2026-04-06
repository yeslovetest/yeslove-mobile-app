import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  mediaFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  playIconWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(44, 41, 41, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    marginLeft: 0.5,
  },
});

export default styles;
