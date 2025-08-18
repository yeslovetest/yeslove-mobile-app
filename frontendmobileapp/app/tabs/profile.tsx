import { ScrollView } from 'react-native';
import styles from "../../Styles/page-styles/ProfileStyles";

/*components */
import ProfileHeader from "../../components/profile-components/ProfileHeader";
import ProfileNavBar from "../../components/profile-components/ProfileNavBar";
import ProfileContent from "../../components/profile-components/ProfileContent";



export default function ProfilePage() {



    return (
      <ScrollView contentContainerStyle={styles.contentContainer} style={styles.container}>
        <ProfileHeader />
        <ProfileNavBar />
        <ProfileContent/>
      </ScrollView>
    );
  }


