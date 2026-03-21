import { View, Text, TouchableOpacity } from "react-native";
import styles from "./EventsNavbarStyles";
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setActiveEventsTabAction } from '@/app/store/Events-store/eventsSlice';
const navBarItems = ["Upcoming", "Attending", "Attended"]

const EventNavbar = () => {
  let activeTab = useAppSelector(state => state.events.view.activeTab);
  let dispatch = useAppDispatch();

  return (
    <View style={styles.navBarContainer}>
      <View style={styles.navBar}>
        {navBarItems.map((tab) => (
          <TouchableOpacity key={tab} style={[styles.navItem, activeTab === tab && styles.activeNavItem]} onPress={() => dispatch(setActiveEventsTabAction(tab))}>
            <Text style={[styles.navText, activeTab === tab && styles.activeNavText]}>{tab}</Text>
            {activeTab === tab && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

export default EventNavbar
