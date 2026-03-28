import { View, Text, TouchableOpacity } from "react-native";
import styles from "./EventsNavbarStyles";
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setActiveEventsTabAction } from '@/app/store/Events-store/eventsSlice';
const navBarItems = ["Upcoming", "Attending", "Attended"]

const normalizeEventTab = (tab?: string) => {
  const normalized = (tab || '').toLowerCase();

  if (normalized === 'attending') {
    return 'Attending';
  }

  if (normalized === 'attended') {
    return 'Attended';
  }

  return 'Upcoming';
};

const EventNavbar = () => {
  let activeTab = useAppSelector(state => state.events.view.activeTab);
  const currentTab = normalizeEventTab(activeTab);
  let dispatch = useAppDispatch();

  return (
    <View style={styles.navBarContainer}>
      <View style={styles.navBar}>
        {navBarItems.map((tab) => (
          <TouchableOpacity key={tab} style={[styles.navItem, currentTab === tab && styles.activeNavItem]} onPress={() => dispatch(setActiveEventsTabAction(tab))}>
            <Text style={[styles.navText, currentTab === tab && styles.activeNavText]}>{tab}</Text>
            {currentTab === tab && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

export default EventNavbar
