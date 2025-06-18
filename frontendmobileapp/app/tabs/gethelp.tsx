import { ScrollView } from 'react-native';
/*components */
import GetHelpHeader from "../../components/gethelp-components/GetHelpHeader";
import GetHelpSearchBar from "../../components/gethelp-components/GetHelpSearchBar";
import GetHelpProfessionals from "../../components/gethelp-components/GetHelpProfessionals";
import styles from "../../Styles/page-styles/GetHelpStyles";
import GetHelpNavbar from '@/components/gethelp-components/GetHelpNavbar';

export default function GetHelpPage() {
  return (
    <ScrollView  contentContainerStyle={styles.contentContainer} style={styles.container}>
      <GetHelpNavbar />
    </ScrollView>
  );
}

