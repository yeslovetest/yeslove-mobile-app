import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 14,
  },
  postCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 10,
  },
  authorInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  timeText: {
    marginTop: 2,
    fontSize: 12,
    color: '#6b7280',
  },
  contentText: {
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  mediaWrap: {
    width: '100%',
    marginBottom: 8,
  },
  footerRow: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerMetric: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  centerState: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  stateText: {
    fontSize: 13,
    color: '#4b5563',
  },
  endText: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 13,
    color: '#b91c1c',
    textAlign: 'center',
  },
});

export default styles;