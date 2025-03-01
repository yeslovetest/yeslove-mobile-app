import React, { useState } from "react"
import { ScrollView, ImageBackground, StyleSheet, Platform, Text, View, Image, TouchableOpacity } from 'react-native';

export default function ProfilePage() {
const [activeTab, setActiveTab] = useState("Timeline");
const [activeAboutTab, setActiveAboutTab] = useState("View")

const navBarItems = [
  "Timeline", "About", "Videos",
  "Notifications", "Photos", "Settings",
  "Messages", "Invitations"
];

const aboutItems = [
  "View", "Edit"
]


  return (
    <ScrollView contentContainerStyle={styles.contentContainer} style={styles.container}>

{/*Profile header*/}

        <View style={styles.profileImageContainer}>

            <ImageBackground style={styles.profileBackgroundImage}  imageStyle={{ borderRadius: 15}} source={{ uri: "https://yeslove.co.uk/wp-content/themes/cirkle/assets/img/dummy-banner.jpg" }}>
                 <View style={styles.overlay}></View>
                 <Image style={styles.profileImage} source={{ uri: "https://yeslove.co.uk/wp-content/themes/cirkle/assets/img/avatar/bp-avatar.png" }}></Image>
                 <Text style={styles.userName}>User Name</Text>
                 <View style={styles.userStatsContainer}>
                    <Text style={styles.userStats}>Posts: <Text style={styles.userStatsNumber}>0</Text></Text>
                    <Text style={styles.userStats}>Comments: <Text style={styles.userStatsNumber}>0</Text></Text>
                    <Text style={styles.userStats}>Views: <Text style={styles.userStatsNumber}>0</Text></Text>
                 </View>
            </ImageBackground>

         </View>  


{/* User bio */}

        <View style={styles.userBioContainer}></View>


{/*Profile navigation*/}

         <View style={styles.navBarContainer}>
             <View style={styles.navBar}>
                 {navBarItems.map((tab, index) => (
                 <TouchableOpacity
                 key={tab}
                 style={[styles.navItem, activeTab === tab && styles.activeNavItem]}
                 onPress={() => setActiveTab(tab)}>
                   <Text style={[styles.navText, activeTab === tab && styles.activeNavText]}> {tab}
                  </Text>
                {activeTab === tab && <View style={styles.activeIndicator} />}
                </TouchableOpacity>))}
              </View>
         </View>


{/* Page Content */}
<View style={styles.content}>

{/*Timeline*/}

{activeTab === 'Timeline' && <Text>Timeline Page Content</Text>}

{/*About*/}

{activeTab === 'About' && (
  <View>
    {/* About navbar */}
    <View style={styles.aboutNavBarContainer}>
      <View style={styles.aboutNavBar}>
        {aboutItems.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.aboutItem, activeAboutTab === tab && styles.activeAboutItem]}
            onPress={() => setActiveAboutTab(tab)}
          >
            <Text style={[styles.navText, activeAboutTab === tab && styles.activeAboutNavText]}>
              {tab}
            </Text>
            {activeAboutTab === tab && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>

    {/* Friends section */}
    <View style={styles.friendsContainer}>
      <View style={styles.friends}>
        <View style={styles.friendsItem}>
          <Text style={styles.activeFriendsText}>
            My Friends
          </Text>
          <View style={styles.activeIndicator} />
        </View>

        {/*friends */}
        <View style={styles.friend}>
           <Image 
           source={{ uri: "https://yeslove.co.uk/wp-content/themes/cirkle/assets/img/avatar/bp-avatar.png" }} 
           style={styles.friendImage} />
           <Text style={styles.friendName}>Friend username</Text>
        </View>


      </View>
    </View>
  </View>
)}


{/*Videos*/}

{activeTab === 'Videos' && <Text>Videos Page Content</Text>}

{/*Notifications*/}

{activeTab === 'Notifications' && <Text>Notifications Page Content</Text>}

{/*Photos*/}

{activeTab === 'Photos' && <Text>Photos Page Content</Text>}

{/*Settings*/}

{activeTab === 'Settings' && <Text>Settings Page Content</Text>}

{/*Messages*/}

{activeTab === 'Messages' && <Text>Messages Page Content</Text>}

{/*Invitations*/}

{activeTab === 'Invitations' && <Text>Invitations Page Content</Text>}

</View>

</ScrollView>
  );
}

const styles = StyleSheet.create({

/*Profile header styles*/

  container: {
    flex: 1,
    marginTop: 10,
  },
  contentContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileImageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  profileBackgroundImage: {
    width: "90vw",
    height: 340,
    display: "flex",
    justifyContent: "center",
    gap: 30,
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 15
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    border: "5px solid #fff"
  },
  userName: {
   color: "#fff",
   fontSize: 20,
   fontWeight: 600
  },
  userStatsContainer: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
  },
  userStats: {
    color: "#c5c5c5",
    size: 20,
    marginLeft: 10,
    marginRight: 10
  },
  userStatsNumber: {
    fontWeight: 600,
    color: "#fff"
  },

/* User bio styles*/

userBioContainer:{
  width: "90%",
  height: 80,
  marginTop: 20,
  borderRadius: 10,
  backgroundColor: "#fff",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  padding: 10,
  color: "#000"
},



/*Navbar styles*/

navBarContainer: {
  flex: 1,
  backgroundColor: "#f8f8f8",
  justifyContent: "flex-start",
  alignItems: "center",
  marginTop: 20
},
navBar: {
  flexDirection: "row",
  flexWrap: "wrap", 
  width: "90vw", 
  justifyContent: "center",
  backgroundColor: "#fff",
  paddingVertical: 10,
  borderRadius: 10, 
  elevation: 3, 
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
},
navItem: {
  width: "50%",
  paddingVertical: 15,
  alignItems: "center",
},
navText: {
  fontSize: 16,
  color: "#666",
  fontWeight: "500",
},
activeNavItem: {
  position: "relative",
},
activeNavText: {
  fontWeight: "bold",
  color: "#000",
},
activeIndicator: {
  width: 40,
  height: 3,
  backgroundColor: "#2d5be3", 
  position: "absolute",
  bottom: -2, 
},
content: {
  marginTop: 20,
  alignItems: "center",
},
pageText: {
  fontSize: 20,
},

/* Friends section styles */

friendsContainer: {
  flex: 1,
  backgroundColor: "#f8f8f8",
  justifyContent: "flex-start",
  alignItems: "center",
  marginTop: 10
},
friends: {
  flexDirection: "column",
  flexWrap: "wrap", 
  width: "80vw", 
  justifyContent: "flex-start",
  backgroundColor: "#fff",
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 10, 
  elevation: 3, 
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
},
friendsItem: {
  width: "50%",
  paddingHorizontal: 5,
  paddingVertical: 15,
  alignItems: "flex-start",
  marginBottom: 15,
},
activeFriendsText: {
  fontWeight: "bold",
  color: "#000",
  fontSize: 19
},

friendsText: {
  fontWeight: "bold",
  color: "#000",
},

/* Friends list*/

friend: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: "#ddd",
},

friendImage: {
  width: 50,
  height: 50,
  borderRadius: 25, 
  marginRight: 10,
},

friendName: {
  fontSize: 16,
  fontWeight: "500",
  color: "#000",
},




/* About navbar styles*/

aboutNavBarContainer: {
  flex: 1,
  backgroundColor: "#f8f8f8",
  justifyContent: "flex-start",
  alignItems: "center",
  marginTop: 10,
  marginBottom: 20,
},
aboutNavBar: {
  flexDirection: "row",
  flexWrap: "wrap", 
  width: "80vw", 
  justifyContent: "center",
  backgroundColor: "#fff",
  paddingVertical: 3,
  borderRadius: 10, 
  elevation: 3, 
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
},
aboutItem: {
  width: "50%",
  paddingVertical: 15,
  alignItems: "center",
},
activeAboutItem: {
  position: "relative",
},
activeAboutNavText: {
  fontWeight: "bold",
  color: "#000",
},


});
