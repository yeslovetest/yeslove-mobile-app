import { ScrollView } from 'react-native';
/*components */
import styles from "../pages/Get-help/Get-help-styles/GetHelpStyles";
import GetHelpNavbar from '@/app/pages/Get-help/Get-help-components/GetHelpNavbar';
import Header from '../Universal-components/Header/Header';


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

