import { View, TouchableOpacity, Text } from "react-native"
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import styles from "./GetHelpNavbarStyles";
import { setActiveGetHelpTabAction } from '@/app/store/Get-help-store/getHelpSlice';

const navBarItems = ["Professionals", "Blogs"]

const GetHelpNavbar = () => {
    const activeTab = useAppSelector(state => state.getHelp.view.activeTab);
    const dispatch = useAppDispatch();
    

    return (
        <View style={styles.navBarContainer}>
            <View style={styles.navBar}>
                {navBarItems.map((tab) => (
                    <TouchableOpacity key={tab} style={[styles.navItem, activeTab === tab && styles.activeNavItem]} onPress={() => dispatch(setActiveGetHelpTabAction(tab))}>
                        <Text style={[styles.navText, activeTab === tab && styles.activeNavText]}>{tab}</Text>
                        {activeTab === tab && <View style={styles.activeIndicator} />}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

export default GetHelpNavbar
