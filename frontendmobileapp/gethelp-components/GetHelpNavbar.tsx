import { View, TouchableOpacity, Text } from "react-native"
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import styles from "@/Styles/page-styles/GetHelpStyles";
import GetHelpProfessionals from "./GetHelpProfessionals";
import GetHelpSearchBar from "./GetHelpSearchBar";
import { setActiveGetHelpTabAction } from '@/app/store/getHelpSlice';

const navBarItems = ["Professionals", "Blogs"]

const GetHelpNavbar = () => {
    let activeTab = useAppSelector(state => state.getHelp.view.activeTab);
    let dispatch = useAppDispatch();

    return (
        <View>
            <View>
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

                {activeTab === "Professionals" && (
                    <View>
                        <GetHelpSearchBar />
                        <GetHelpProfessionals />
                    </View>
                )}

                {activeTab === "Blogs" && (
                    <View />
                )}
            </View>
        </View>
    )
}

export default GetHelpNavbar
