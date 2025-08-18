import { ScrollView } from 'react-native';
import styles from '../pages/Profile/Profile-styles/ProfileStyles';

/*components */
import ProfileHeader from "../pages/Profile/Profile-components/ProfileHeader";
import ProfileNavBar from "../pages/Profile/Profile-components/ProfileNavBar";
import ProfileContent from "../pages/Profile/Profile-components/ProfileContent";
import Header from '../Universal-components/Header/Header';
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


