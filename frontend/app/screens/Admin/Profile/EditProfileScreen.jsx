import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import baseURL from '@/assets/common/baseurl';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import Spinner from "../../../../assets/common/spinner";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function EditProfile() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [barangays, setBarangays] = useState([]); // State for barangays
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        if (!token) throw new Error('User not logged in');

        const decoded = jwtDecode(token);
        const userId = decoded?.userId;

        if (!userId) throw new Error('User ID not found in token');

        const response = await axios.get(`${baseURL}users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const { name, email, contactNumber, street, barangay, city } = response.data;
        setName(name);
        setEmail(email);
        setMobile(contactNumber);
        setStreet(street || '');
        setBarangay(barangay || '');
        setCity(city || '');
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchBarangays = async () => {
      try {
        const response = await axios.get(`${baseURL}barangays`); // Assuming the endpoint for fetching barangays
        const result = response.data;

        // Format barangay data for RNPickerSelect
        const formattedBarangays = result.map((item) => ({
          label: item.name,
          value: item.name,
        }));
        setBarangays(formattedBarangays);
      } catch (error) {
        console.error('Error fetching barangays:', error);
      }
    };

    fetchUserData();
    fetchBarangays(); // Fetch barangays on component mount
  }, []);

  const handleConfirm = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) throw new Error('User not logged in');

      const userId = jwtDecode(token)?.userId;

      await axios.put(`${baseURL}users/${userId}`, {
        name,
        email,
        contactNumber: mobile,
        street,
        barangay,
        city,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      Alert.alert('Success', 'Profile updated successfully');
      router.push('/drawer/AdminDrawer');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'There was an issue updating your profile.');
    }
  };

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
        <Text style={styles.headerText}>Edit Profile</Text>
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
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          editable={false} // Email is not editable
        />

        <Text style={styles.label}>Mobile Number</Text>
        <TextInput
          style={styles.input}
          value={mobile}
          onChangeText={setMobile}
        />

        <Text style={styles.label}>Street</Text>
        <TextInput
          style={styles.input}
          value={street}
          onChangeText={setStreet}
        />

        <Text style={styles.label}>Barangay</Text>
        <RNPickerSelect
          onValueChange={(value) => setBarangay(value)}
          items={barangays} // Use fetched barangays here
          style={pickerSelectStyles}
          placeholder={{
            label: 'Select your barangay',
            value: null,
            color: '#AAB4C1',
          }}
          Icon={() => {
            return <Ionicons name="chevron-down" size={24} color="#AAB4C1" />;
          }}
          value={barangay}
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
        />
      </View>
      <TouchableOpacity style={styles.changePasswordContainer}  onPress={() => router.push('/screens/Admin/Profile/ChangePassword')}>
        <Text style={styles.changePasswordText}>Change Password</Text>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>CONFIRM</Text>
      </TouchableOpacity>
      </>
      )}
    </KeyboardAwareScrollView>
  );
}

// Styles for RNPickerSelect
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
    color: '#333',
    paddingRight: 30,
  },
  inputAndroid: {
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
    color: '#333',
    paddingRight: 30,
  },
  iconContainer: {
    top: 15,
    right: 10,
  },
});

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    backgroundColor: '#0B607E', 
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
  confirmButton: {
    backgroundColor: '#0B607E',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
});
