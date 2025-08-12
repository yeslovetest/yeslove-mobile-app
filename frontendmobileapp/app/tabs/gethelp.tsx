import { ScrollView } from 'react-native';
/*components */
import styles from "../../Styles/page-styles/GetHelpStyles";
import GetHelpNavbar from '@/components/gethelp-components/GetHelpNavbar';
import Header from '../Header';


export default function GetHelpPage() {
  return (
    <>
    <Header mainTitle="Yeslove!"></Header>
    <ScrollView  contentContainerStyle={styles.contentContainer} style={styles.container}>
      <GetHelpNavbar />
    </ScrollView>
    </>
  );
}

