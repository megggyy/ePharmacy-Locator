import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import Toast from 'react-native-toast-message';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import * as Location from 'expo-location';
import baseURL from "../../../../assets/common/baseurl";

const CustomerSignup = () => {
  const router = useRouter();

  const [location, setLocation] = useState({
    latitude: 14.517618,
    longitude: 121.050863,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState(null);
  const [city, setCity] = useState("Taguig City");
  const [diseases, setDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [customDisease, setCustomDisease] = useState('');
  const [barangays, setBarangays] = useState([]); // State for storing barangays
  const [loading, setLoading] = useState(true);

  // Fetch diseases, barangays, and location on mount
  useEffect(() => {
    // Request location permissions
    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert('We need access to your location to show your position on the map.');
        }
      } catch (error) {
        console.error('Error requesting location permissions:', error);
      }
    };

    // Fetch diseases
    const fetchDiseases = async () => {
      try {
        const response = await fetch(`${baseURL}diseases`);
        const result = await response.json();

        // Format data for the picker
        const formattedData = result.map((item) => ({
          label: item.name,
          value: item.name,
        }));
        formattedData.push({ label: 'None', value: '' });
        formattedData.push({ label: 'Others', value: 'others' });
        setDiseases(formattedData);
      } catch (error) {
        console.error('Error fetching diseases:', error);
      }
    };

    // Fetch barangays
    const fetchBarangays = async () => {
      try {
        const response = await fetch(`${baseURL}barangays`); // Endpoint for fetching barangays
        const result = await response.json();

        // Format barangays data for RNPickerSelect
        const formattedBarangays = result.map((item) => ({
          label: item.name,
          value: item.name,
        }));
        setBarangays(formattedBarangays);
      } catch (error) {
        console.error('Error fetching barangays:', error);
      }
    };

    // Execute the functions
    requestLocationPermission();
    fetchDiseases();
    fetchBarangays();
  }, []); // Empty dependency array to only run once

  // Get current location - Now outside of useEffect
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert("We need access to your location to show your position on the map.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setLocation({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      Toast.show({
        position: 'bottom',
        bottomOffset: 20,
        type: "error",
        text1: "Location Error",
        text2: "Unable to fetch current location",
      });
      console.error(error);
    }
  };

  // Register function (submit form data)
  const register = async () => {
    const formData = {
      name,
      email,
      contactNumber,
      password,
      street,
      barangay,
      city,
      location: { latitude: location.latitude, longitude: location.longitude },
      diseases: selectedDisease === 'others' ? customDisease : selectedDisease,
    };

    try {
      const res = await axios.post(`${baseURL}users/register`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 200) {
        Toast.show({
          topOffset: 60,
          type: "success",
          text1: "Registration Succeeded",
          text2: "Please log in to your account",
        });
        setTimeout(() => router.push('../../Auth/LoginScreen'), 500);
      }
    } catch (error) {
      Toast.show({
        position: 'bottom',
        bottomOffset: 20,
        type: "error",
        text1: "Something went wrong!",
        text2: "Please try again",
      });
      console.error(error.message);
    }
  };

  // Handle manual marker drag
  const handleMarkerDragEnd = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ ...location, latitude, longitude });
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      {/* Header Back Icon */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Logo */}
      <Image source={require('@/assets/images/epharmacy-logo.png')} style={styles.logo} />

      {/* Title */}
      <Text style={styles.title}>Sign Up as Customer</Text>

      {/* Input Fields */}
      <View style={styles.inputSection}>
        <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#AAB4C1" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#AAB4C1" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Contact number" placeholderTextColor="#AAB4C1" value={contactNumber} onChangeText={setContactNumber} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#AAB4C1" value={password} onChangeText={setPassword} secureTextEntry={true} />

        <RNPickerSelect
          onValueChange={(value) => setBarangay(value)}
          items={barangays} // Use fetched barangays here
          style={pickerSelectStyles}
          placeholder={{
            label: 'Select your barangay',
            value: null,
            color: '#AAB4C1',
          }}
          Icon={() => <Ionicons name="chevron-down" size={24} color="#AAB4C1" />}
        />

        <TextInput
          style={styles.input}
          placeholder="Street (Optional)"
          value={street}
          onChangeText={setStreet}
        />

        <TextInput
          style={styles.input}
          placeholder="City"
          value={city}
          editable={false}
        />

        {/* Map Section */}
        <Text style={styles.title}>Select Location</Text>
        <MapView
          style={styles.map}
          region={location}
          onPress={(e) => setLocation({ ...location, ...e.nativeEvent.coordinate })}
        >
          <Marker
            coordinate={location}
            draggable
            onDragEnd={handleMarkerDragEnd}
          />
        </MapView>

        {/* Button to use current location */}
        <TouchableOpacity style={styles.currentLocationButton} onPress={getCurrentLocation}>
          <Text style={styles.currentLocationButtonText}>Use My Current Location</Text>
        </TouchableOpacity>

        {/* Disease Dropdown */}
        <RNPickerSelect
          onValueChange={(value) => {
            setSelectedDisease(value);
            if (value !== 'others') setCustomDisease('');
          }}
          items={diseases}
          style={pickerSelectStyles}
          placeholder={{
            label: 'Choose your disease',
            value: null,
            color: '#AAB4C1',
          }}
          Icon={() => <Ionicons name="chevron-down" size={24} color="#AAB4C1" />}
        />

        {selectedDisease === 'others' && (
          <TextInput
            style={styles.input}
            placeholder="Please Specify"
            value={customDisease}
            onChangeText={setCustomDisease}
          />
        )}

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={register}>
          <Text style={styles.signUpButtonText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default CustomerSignup;


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
    backgroundColor: '#0F6580',
    padding: 20,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  logo: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  signUpButton: {
    backgroundColor: '#027DB1',
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 20,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  loginLink: {
    color: '#00A896',
    fontWeight: 'bold',
  },
});