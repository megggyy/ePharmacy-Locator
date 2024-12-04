import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from "jwt-decode"; // Corrected import for jwtDecode
import axios from 'axios'; // Import axios
import baseURL from '@/assets/common/baseurl';
import Spinner from "../../../../assets/common/spinner";

export default function ViewProfile() {
  const router = useRouter();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        if (!token) throw new Error('User not logged in');
        const decoded = jwtDecode(token);

        const userId = decoded?.userId; // Ensure the correct field name
        if (!userId) throw new Error('User ID not found in token');

        const response = await axios.get(`${baseURL}users/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;

        setUserData({ ...data });
      } catch (error) {
        Alert.alert('Error', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const address = `${userData.street || ''}, ${userData.barangay || ''}, ${userData.city || ''}`.replace(/(, )+/g, ', ').trim();

  return (
    <View style={styles.container}>
       {loading ? (
        <Spinner /> // Show the custom spinner component when loading
      ) : (
        <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>View Profile</Text>
      </View>

      <View style={styles.profileImageSection}>
        <Image
           source={require('@/assets/images/adminepharmacy.png')}
          style={styles.profileImage}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={userData.name}
          onChangeText={(value) => setUserData({ ...userData, name: value })}
          editable={false}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={userData.email} editable={false} />

        <Text style={styles.label}>Mobile Number</Text>
        <TextInput style={styles.input} value={userData.contactNumber} editable={false} />

        {/* Single Address Field */}
        <Text style={styles.label}>Address</Text>
        <TextInput style={styles.input} value={address || 'N/A'} editable={false} />

      </View>
      </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    backgroundColor: '#0B607E', // Blue header background, full width
    paddingTop: 80,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileImageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  selectImageButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  selectImageText: {
    color: '#555',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20, // Added left-right padding to input fields container
    marginBottom: 20,
  },
  label: {
    color: '#666',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F4F4F4',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  changePasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 20, // Padding added to the "Change Password" button
    marginBottom: 30,
  },
  changePasswordText: {
    fontSize: 16,
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#0B607E',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20, // Padding added to the confirm button
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
