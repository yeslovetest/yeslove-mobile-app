import { ScrollView } from 'react-native';
/*components */
import styles from "../../Styles/page-styles/GetHelpStyles";
import GetHelpNavbar from '@/components/gethelp-components/GetHelpNavbar';

export default function GetHelpPage() {
  return (
    <ScrollView  contentContainerStyle={styles.contentContainer} style={styles.container}>
      <GetHelpNavbar />
    </ScrollView>
  );
}

