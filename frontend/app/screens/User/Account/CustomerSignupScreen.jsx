import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import RNPickerSelect from 'react-native-picker-select';
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import MapView, { Marker } from 'react-native-maps';  // Import MapView and Marker

import mime from "mime";
import axios from "axios";

import baseURL from "../../../../assets/common/baseurl";

const CustomerSignup = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState(null);
  const [city, setCity] = useState("Taguig City");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [region, setRegion] = useState({
    latitude: 14.520445,
    longitude: 121.053886,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [images, setImages] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility

  useEffect(() => {

    const fetchBarangays = async () => {
      try {
        const response = await fetch(`${baseURL}barangays`);
        const result = await response.json();
        const formattedBarangays = result.map((item) => ({
          label: item.name,
          value: item.name,
        }));
        setBarangays(formattedBarangays);
      } catch (error) {
        console.error("Error fetching barangays:", error);
      }
    };

    fetchBarangays();
    getCurrentLocation();
  }, []);

  // Function to get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission denied", "You need to grant location permission to use this feature.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      // Set the region to the current location
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error("Error fetching current location:", error);
      Alert.alert("Error", "Unable to fetch current location. Please try again.");
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLatitude(latitude);
    setLongitude(longitude);

    // Update the region when the map is pressed
    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [5, 5],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map((asset) => ({ id: images.length, uri: asset.uri }));
      const filteredImages = images.filter(image => image.uri !== undefined);
      setImages([...filteredImages, ...selectedImages]);
    }
  };

  const removeImage = (id) => {
    setImages(images.filter((image) => image.id !== id));
  };

  const validate = () => {
    let errorMessages = {};
    if (!name) errorMessages.name = "NAME IS REQUIRED";
    if (!email) errorMessages.email = "EMAIL IS REQUIRED";
    if (!contactNumber) {
      errorMessages.contactNumber = "CONTACT NUMBER IS REQUIRED";
    } else if (contactNumber.length !== 11) {
      errorMessages.contactNumber = "CONTACT NUMBER MUST BE 11 CHARACTERS";
    }
    if (!password) {
      errorMessages.password = "PASSWORD IS REQUIRED";
    } else if (password.length < 8) {
      errorMessages.password = "PASSWORD MUST BE AT LEAST 8 CHARACTERS";
    }    if (!street) errorMessages.street = "STREET IS REQUIRED";
    if (!barangay) errorMessages.barangay = "PLEASE SELECT YOUR BARANGAY";
    if (images.length === 0) errorMessages.images = "PLEASE UPLOAD AT LEAST ONE IMAGE";


    return errorMessages;
  };

  const register = () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Prepare form data for submission
    let formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('contactNumber', contactNumber);
    formData.append('password', password);
    formData.append('street', street);
    formData.append('barangay', barangay);
    formData.append('city', city);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append('isAdmin', 'false');
    formData.append('role', 'Customer');

    // Append images to FormData
    images.forEach((image, index) => {
      formData.append(`images`, {
        uri: image.uri,
        type: mime.getType(image.uri),
        name: `image${index}.${mime.getExtension(mime.getType(image.uri))}`,
      });
    });

    const config = {
      headers: { "Content-Type": "multipart/form-data" },
    };

    // Make API call
    axios
      .post(`${baseURL}users/register`, formData, config)
      .then((res) => {
        console.log(res.data)
        if (res.status === 200 || res.status === 201) {
          const userId = res.data.userId;
          Toast.show({
            type: "success",
            text1: "REGISTRATION SUCCEEDED",
            text2: "Please verify your otp.",
          });
          console.log("User ID from response:", userId);  // Add this line to check if the userId is correct
          setTimeout(() => {
            router.push({
              pathname: '/screens/Auth/OTPVerification/VerifyOTP',
              params: { userId },
            });
          }, 500);
        }
      })
      .catch((error) => {
        if (error.response) {
          // Handle specific error messages
          const { message } = error.response.data;

          if (message === 'NOT_UNIQUE_EMAIL') {
            Toast.show({
              type: "error",
              text1: "EMAIL ALREADY IN USE!",
              text2: "Please use a different email address.",
            });
          } else if (message === 'NOT_UNIQUE_CONTACT_NUMBER') {
            Toast.show({
              type: "error",
              text1: "CONTACT NUMBER ALREADY IN USE!",
              text2: "Please use a different contact number.",
            });
          } else {
            // Handle generic errors
            Toast.show({
              type: "error",
              text1: "REGISTRATION FAILED!",
              text2: "Please try again later.",
            });
          }
        } else {
          Toast.show({
            type: "error",
            text1: "NETWORK ERROR!",
            text2: "Please check your internet connection and try again.",
          });
        }
      });

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
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#AAB4C1" value={email} onChangeText={setEmail} keyboardType="email-address" />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        <TextInput style={styles.input} placeholder="Contact number" placeholderTextColor="#AAB4C1" value={contactNumber} onChangeText={setContactNumber} keyboardType="phone-pad" />
        {errors.contactNumber && <Text style={styles.errorText}>{errors.contactNumber}</Text>}
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.inputPass, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor="#AAB4C1"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Icon
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#AAB4C1"
            />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <TextInput style={styles.input} placeholder="Street" placeholderTextColor="#AAB4C1" value={street} onChangeText={setStreet} />
        {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}

        <RNPickerSelect
          onValueChange={(value) => setBarangay(value)}
          items={barangays} // Use fetched barangays here
          style={pickerSelectStyles}
          placeholder={{
            label: 'Select your barangay',
            value: null,
            color: '#AAB4C1',
          }}
          value={barangay}
        />
        {errors.barangay && <Text style={styles.errorText}>{errors.barangay}</Text>}

        <TextInput style={styles.input} placeholder="City" placeholderTextColor="#AAB4C1" value={city} editable={false} />


        <Text style={styles.uploadLabel}>Pin Exact Location</Text>
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


        {/* Buttons for location selection */}
        <TouchableOpacity onPress={getCurrentLocation} style={styles.locationButton}>
          <Text style={styles.buttonText}>Get Current Location</Text>
        </TouchableOpacity>

        {/* Display latitude and longitude */}
        {latitude && longitude && (
          <View style={styles.locationInfo}>
          <Text style={styles.locationPin}>
            Latitude: {latitude.toFixed(5)}...
          </Text>
          <Text style={styles.locationPin}>
            Longitude: {longitude.toFixed(5)}...
          </Text>
        </View>
        
        )}

       

        {/* Upload Images UI */}
        <Text style={styles.uploadLabel}>Upload Your Image</Text>
        <View style={styles.uploadContainer}>
          {images.map((imageURL, index) => {
            return (
              <View key={index} style={styles.imageContainer}>
                <Image style={styles.image} source={{ uri: imageURL.uri }} />
                <TouchableOpacity onPress={() => removeImage(imageURL.id)} style={styles.removeButton}>
                  <Ionicons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            );
          })}
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color="white" />
            <Text style={styles.uploadButtonText}>Select Image</Text>
          </TouchableOpacity>
        </View>
        {errors.images && <Text style={styles.errorImages}>{errors.images}</Text>}

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={() => register()}>
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
    color: '#000000',
    textStyles: '#000000',
    paddingRight: 30,
  },
  inputAndroid: {
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    marginVertical: 10,
    fontSize: 16,
    color: '#000000',
    textStyles: '#000000',
    padding: 0,
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
  inputPass: {
    backgroundColor: '#F2F2F2',
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    padding: 10,
    paddingTop: 0,
    paddingBottom: 0,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 9,
    paddingRight: 5,
  },
  uploadLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  uploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 0,
    justifyContent: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#027DB1',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 60,
    height: 60,
    margin: 5,
  },
  imagePicker: {
    width: 100,
    height: 100,
    margin: 5,
    backgroundColor: "grey",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "red",
    padding: 5,
    borderRadius: 10,
    zIndex: 1,
  },
  removeButtonText: {
    color: "white",
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
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -4,
    marginBottom: 5,
    textAlign: 'center',
  },
  errorImages: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 5,
    textAlign: 'center',
  },
  map: {
    height: 300,
    width: '100%',
    borderRadius: 10,
    marginBottom: 20,
  },
  locationButton: {
    backgroundColor: '#027DB1',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  locationInfo: {
    marginBottom: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationPin: {
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    fontSize: 16,
    color: '#333',
  },
});