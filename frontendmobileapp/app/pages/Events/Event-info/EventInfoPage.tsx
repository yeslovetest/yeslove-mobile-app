import { ScrollView } from "react-native";
import EventsInfoHeader from "./Events-info-components/EventsPageHeader/EventsInfoHeader";
import styles from "./EventsInfoPageStyles";
import EventsInfoDetails from "./Events-info-components/Events-info-details/EventInfoDetails";
import Header from "@/app/Universal-components/Header/Header";

const EventInfoPage = () => {
  return (
    <>
      <Header></Header>
      <ScrollView
        contentContainerStyle={styles.pageContent}
        style={styles.indEventsContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
      >
        <EventsInfoHeader />
        <EventsInfoDetails />
      </ScrollView>
    </>
  );
};

export default EventInfoPage;
