import React, { useContext,  useState, useCallback  } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar } from 'react-native';
import { useFocusEffect} from "@react-navigation/native"
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios"
import Toast from "react-native-toast-message";
import AuthGlobal from '@/context/AuthGlobal';
import baseURL from "../../../assets/common/baseurl"

export default function Sidebar() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState({});
  const { state, dispatch } = useContext(AuthGlobal);


  useFocusEffect(
    useCallback(() => {
      if (state.isAuthenticated === false || state.isAuthenticated === null) {
        router.push('../screens/Auth/LoginScreen');
      }

      AsyncStorage.getItem("jwt")
        .then((res) => {
          axios
            .get(`${baseURL}users/${state.user.userId}`, {
              headers: { Authorization: `Bearer ${res}` },
            })
            .then((user) => {
              setUserProfile(user.data);  // Set user data state here
              console.log(user.data);      // Now the data will be logged after the state is updated
              console.log("Profile image URL:", user.data.customerDetails?.images?.[0]);

             
            })
            .catch((error) => console.log("Error fetching user data:", error));
        })
        .catch((error) => console.log(error));

      return () => {
        setUserProfile(); // Reset user profile on cleanup
     
      };
    }, [state.isAuthenticated, state.user.userId, router])  // Add `state.user.userId` and `router` to dependencies
  );



  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('jwt');
      dispatch({ type: 'LOGOUT_USER' });
      router.replace('/(tabs)');
      Toast.show({
        topOffset: 60,
        type: "success",
        text1: "LOGOUT SUCCESSFUL",
      })
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const profileImage =
    userProfile?.customerDetails?.images?.[0] && typeof userProfile.customerDetails.images[0] === 'string'
      ? { uri: userProfile.customerDetails.images[0] }
      : require('@/assets/images/sample.jpg');

  return (
    <View style={styles.container}>
       <StatusBar backgroundColor="#0B607E" barStyle="light-content" />
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Profile Section */}
      <View style={styles.profileSection}>
    <Image
        source={profileImage}
        style={styles.profileImage}
    />
    <Text style={styles.profileName}>{userProfile?.name}</Text>
</View>


      {/* Menu Section */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/screens/User/Profile/ViewProfileScreen')}>
          <Ionicons name="eye" size={25} color="#5A5A5A" />
          <Text style={styles.menuText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/screens/User/Profile/EditProfileScreen')}>
          <FontAwesome5 name="user-edit" size={25} color="#5A5A5A" />
          <Text style={styles.menuText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/screens/User/Features/SuggestedMedicine')}>
          <FontAwesome5 name="prescription-bottle" size={25} color="#5A5A5A" />
          <Text style={styles.menuText}>Suggested Medicine</Text>
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/screens/User/Features/Maps')}>
          <FontAwesome5 name="map-marker-alt" size={25} color="#5A5A5A" />
          <Text style={styles.menuText}>Maps</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/screens/User/Features/Settings')}>
          <FontAwesome5 name="cog" size={25} color="#5A5A5A" />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>

        {/* Log out button */}
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={25} color="#5A5A5A" />
          <Text style={styles.menuText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#0B607E', // Keep the header background blue
    paddingTop: 50,
    paddingTop: 50,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75, // Circular image
    marginBottom: 10,
  },
  profileName: {
    color: 'white', // Keep the profile name white
    fontSize: 25,
    fontWeight: 'bold',
  },
  menuSection: {
    marginTop: 20,
    backgroundColor: 'white', // White background for the menu section
    paddingHorizontal: 20,
    flex: 1, // To take up the remaining space
    borderTopLeftRadius: 20, // Rounded corners for a nice look
    borderTopRightRadius: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuText: {
    fontSize: 18,
    marginLeft: 15,
    color: '#5A5A5A', // Dark text color for better contrast on white background
  },
});
