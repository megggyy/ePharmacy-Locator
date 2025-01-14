import React, { useContext,  useState, useCallback  } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
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
  const [isDropdownVisible, setDropdownVisible] = useState(false); // State to toggle dropdown

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

    
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
                        
                        setUserProfile(user.data); // Update the user profile state
                        console.log("User data fetched:", user.data); // Log the fetched user data
                        console.log("Profile image URL:", user.data.pharmacyDetails?.images?.[0]);

                        
                    })
                    .catch((error) => console.log("Error fetching user data:", error));
            })
            .catch((error) => console.log("Error getting JWT:", error));

        return () => {
            setUserProfile(); // Reset user profile on cleanup
          
        };
    }, [state.isAuthenticated, state.user.userId, router]) // Correct dependencies
);


  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('jwt');
      dispatch({ type: 'LOGOUT_USER' });
      router.push('/(tabs)'); 
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
  userProfile?.pharmacyDetails?.images?.[0] && typeof userProfile.pharmacyDetails.images[0] === 'string'
    ? { uri: userProfile.pharmacyDetails.images[0] }
    : require('@/assets/images/sample.jpg');
  return (
    <View style={styles.container}>
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

      {/* Admin Menu Section */}
      <View style={styles.menuSection}>
      <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/screens/PharmacyOwner/Profile/ViewProfile')}>
        <Ionicons name="eye" size={25} color="#5A5A5A" /> 
        <Text style={styles.menuText}>View Profile</Text>
      </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/screens/PharmacyOwner/Profile/EditPharmacyProfileScreen')}>
          <FontAwesome5 name="clinic-medical" size={25} color="#5A5A5A" />
          <Text style={styles.menuText}>Edit Pharmacy</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/screens/PharmacyOwner/MedicationCategory/ListCategories')}>
          <FontAwesome5 name="tags" size={25} color="#5A5A5A" />
          <Text style={styles.menuText}>Medication Categories</Text>
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/screens/PharmacyOwner/Medications/ListMedications')}>
          <FontAwesome5 name="pills" size={25} color="#5A5A5A" />
          <Text style={styles.menuText}>Medications</Text>
        </TouchableOpacity>

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
    backgroundColor: '#0B607E',
    paddingTop: 100,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  profileName: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
  },
  menuSection: {
    marginTop: 20,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    flex: 1,
    borderTopLeftRadius: 20,
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
    color: '#5A5A5A',
  },
});
