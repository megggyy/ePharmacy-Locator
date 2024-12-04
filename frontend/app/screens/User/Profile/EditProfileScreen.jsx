import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import baseURL from '@/assets/common/baseurl';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';

export default function EditProfile() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [barangays, setBarangays] = useState([]); // State for barangays
  const [images, setImages] = useState([]); // State for selected images
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

        const { name, email, contactNumber, street, barangay, city, customerDetails } = response.data;
        setName(name);
        setEmail(email);
        setMobile(contactNumber);
        setStreet(street || '');
        setBarangay(barangay || '');
        setCity(city || '');
      
         // Fetch images
      const fetchedImages = customerDetails?.images || [];
      setImages(fetchedImages);
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchBarangays = async () => {
      try {
        const response = await axios.get(`${baseURL}barangays`);
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
    fetchBarangays();
  }, []);

  const selectImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleDeleteImage = (uri) => {
    setImages(images.filter(image => image !== uri));
  };

  const handleConfirm = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      if (!token) throw new Error('User not logged in');
  
      const userId = jwtDecode(token)?.userId;
  
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('contactNumber', mobile);
      formData.append('street', street);
      formData.append('barangay', barangay);
      formData.append('city', city);
  
      // Iterate over images to prepare them for upload
      images.forEach((uri) => {
        const filename = uri.split('/').pop();
        const type = `image/${filename.split('.').pop()}`;
        formData.append('images', {
          uri,
          name: filename,
          type,
        });
      });
  
      await axios.put(`${baseURL}users/${userId}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      Alert.alert('Success', 'Profile updated successfully');
      router.push('/drawer/UserDrawer');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'There was an issue updating your profile.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Profile</Text>
      </View>

      <View style={styles.profileImageSection}>
        <View style={styles.imagePreviewContainer}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.profileImage} />
              <TouchableOpacity
                style={styles.deleteImageButton}
                onPress={() => handleDeleteImage(uri)}
              >
                <Ionicons name="trash" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.selectImageButton} onPress={selectImages}>
          <Text style={styles.selectImageText}>Select Images</Text>
        </TouchableOpacity>
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

      {/* Change Password Option */}
      <TouchableOpacity style={styles.changePasswordContainer}  onPress={() => router.push('/screens/User/Profile/ChangePassword')}>
        <Text style={styles.changePasswordText}>Change Password</Text>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>CONFIRM</Text>
      </TouchableOpacity>
    </View>
  );
}

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
    flex: 1,
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
    left: 20,
    top: 35,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileImageSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 0,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  deleteImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'red',
    borderRadius: 15,
    padding: 5,
  },
  selectImageButton: {
    backgroundColor: '#0B607E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom:10,
  },
  selectImageText: {
    color: 'white',
    fontSize: 16,
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
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});
