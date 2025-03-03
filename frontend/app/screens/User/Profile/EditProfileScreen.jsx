import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import baseURL from '@/assets/common/baseurl';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import Spinner from "../../../../assets/common/spinner";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function EditProfile() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  // const [street, setStreet] = useState('');
  // const [barangay, setBarangay] = useState('');
  // const [city, setCity] = useState('');
  // const [barangays, setBarangays] = useState([]); // State for barangays
  const [images, setImages] = useState([]); // State for selected images
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [region, setRegion] = useState({
    latitude: 14.520445,
    longitude: 121.053886,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

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

        const { name, email, contactNumber, address, customerDetails } = response.data;
        setUserId(userId);
        setName(name);
        setEmail(email);
        setMobile(contactNumber);
        setAddress(address || '');

        // Extract latitude and longitude from customerDetails, fallback to default values if not available
        const latitude = customerDetails?.latitude || 14.5995;
        const longitude = customerDetails?.longitude || 120.9842;
        
        setLatitude(latitude);
        setLongitude(longitude);
        
        // Fetch images
        const fetchedImages = customerDetails?.images || [];
        setImages(fetchedImages);
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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
      formData.append('address', address);

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

  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
        
    setLatitude(latitude);
    setLongitude(longitude);
  
    await fetchAddressFromCoords(latitude, longitude);

    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };
  
  const fetchAddressFromCoords = async (lat, lon) => {
    try {
      let locationResponse = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      if (locationResponse.length > 0) {
        const { name, district, city } = locationResponse[0];
        const formattedAddress = `${name || ''} ${district || ''}, ${city || ''}`;
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to fetch current location.');
        return;
      }
  
      let location = await Location.getCurrentPositionAsync({});
      
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
  
      await fetchAddressFromCoords(location.coords.latitude, location.coords.longitude);
        
      // Update map region
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
    } catch (error) {
      console.error('Error fetching current location:', error);
      Alert.alert('Error', 'Unable to fetch current location.');
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

        <Text style={styles.label}>Address</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} />
        
        <Text style={styles.label}>Update Location</Text>
          <MapView
          style={styles.map}
          region={region} // Dynamically update the region
          onPress={handleMapPress}
          showsUserLocation={true} // Show user's current location on the map
        >
          {latitude && longitude && (
           <Marker
           coordinate={{ latitude, longitude }}
           draggable={true}
           onDragEnd={(e) => {
             const { latitude, longitude } = e.nativeEvent.coordinate;
             setLatitude(latitude);
             setLongitude(longitude);
     
             // Update the region when the marker is dragged
             setRegion({
               latitude,
               longitude,
               latitudeDelta: 0.0922,
               longitudeDelta: 0.0421,
             });
           }}
         />
          )}
        </MapView>


          <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
            <Text style={styles.locationButtonText}>Get Current Location</Text>
          </TouchableOpacity>

            
          </View>

          {/* Change Password Option */}
          <TouchableOpacity
            style={styles.changePasswordContainer}
            onPress={() => router.push({ pathname: '/screens/Auth/ChangePassword/ChangePassword', params: { userId } })}
          >
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
    paddingTop: 10,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 10,
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
    marginBottom: 10,
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
  // location
  map: { width: '90%', height: 200, alignSelf: 'center', borderRadius: 10, marginBottom: 20 },
  locationButton: { backgroundColor: '#0B607E', paddingVertical: 10, marginHorizontal: 20, borderRadius: 10, marginBottom: 10 },
  locationButtonText: { color: 'white', textAlign: 'center', fontSize: 16 },
  confirmButton: { backgroundColor: '#0B607E', paddingVertical: 15, marginHorizontal: 20, borderRadius: 10 },
  confirmButtonText: { color: 'white', textAlign: 'center', fontSize: 16 },
});
