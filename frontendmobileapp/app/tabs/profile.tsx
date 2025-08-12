import { ScrollView } from 'react-native';
import styles from "../../Styles/page-styles/ProfileStyles";

/*components */
import ProfileHeader from "../../components/profile-components/ProfileHeader";
import ProfileNavBar from "../../components/profile-components/ProfileNavBar";
import ProfileContent from "../../components/profile-components/ProfileContent";
import Header from '../Header';
import { useAppSelector } from '../store/hooks';



export default function ProfilePage() {
 const userId = useAppSelector((state) => state.navigation.tabStack.at(-1)?.data?.userId);
 const userName = useAppSelector((state) => state.profile.profiles[userId]?.username ?? "");

    return (
      <>
      <Header mainTitle={userName}></Header>
      <ScrollView contentContainerStyle={styles.contentContainer} style={styles.container}>
        <ProfileHeader />
        <ProfileNavBar />
        <ProfileContent/>
      </ScrollView>
      </>
    );
  }


