import React, { useState, useEffect } from 'react'; 
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import baseURL from '@/assets/common/baseurl';
import Spinner from "../../../../assets/common/spinner";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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

        const response = await fetch(`${baseURL}users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();

        // Check if disease information exists
        const disease = data.customerDetails?.disease?.name || 'N/A';
        setUserData({ ...data, disease });
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const address = `${userData.street || ''}, ${userData.barangay || ''}, ${userData.city || ''}`.replace(/(, )+/g, ', ').trim();
  console.log('Image source:', userData?.pharmacyDetails?.images?.[0]);
  const profileImage =
    userData?.pharmacyDetails?.images?.[0] && typeof userData.pharmacyDetails.images[0] === 'string'
      ? { uri: userData.pharmacyDetails.images[0] }
      : require('@/assets/images/sample.jpg');

  return (
    <KeyboardAwareScrollView style={styles.container}>
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
            {profileImage.uri ? (
              <Image
                source={profileImage}
                style={styles.profileImage}
              />
            ) : (
              <Image
                source={require('@/assets/images/sample.jpg')}
                style={styles.profileImage}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={userData.name}
              editable={false}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={userData.email} editable={false} />

            <Text style={styles.label}>Mobile Number</Text>
            <TextInput style={styles.input} value={userData.contactNumber} editable={false} />

            <Text style={styles.label}>Address</Text>
            <TextInput style={styles.input} value={address || 'N/A'} editable={false} />

            <Text style={styles.label}>Business Days</Text>
            <TextInput
              style={styles.input}
              value={userData.pharmacyDetails?.businessDays || 'N/A'}
              editable={false}
            />

            <Text style={styles.label}>Store Hours</Text>
            <TextInput
              style={styles.input}
              value={`${userData.pharmacyDetails?.openingHour || 'N/A'} - ${userData.pharmacyDetails?.closingHour || 'N/A'}`}
              editable={false}
            />
          </View>
        </>
      )}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    backgroundColor: '#005b7f', // Blue header background, full width
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
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
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
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
});
