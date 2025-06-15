import { View, Text, TouchableOpacity } from "react-native";
import styles from "@/Styles/page-styles/EventsStyles";
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setActiveEventsTabAction } from '@/app/store/eventsSlice';
import Event from "./EventsList";

const navBarItems = ["Upcoming", "Attending", "Attended"]

const EventNavbar = () => {
  let activeTab = useAppSelector(state => state.events.view.activeTab);
  let dispatch = useAppDispatch();

  return (
    <View>
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

      {activeTab === "Upcoming" && (
        <View>
          <Event />
        </View>
      )}
    </View>
  )
}

export default EventNavbar
