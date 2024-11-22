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
import RNPickerSelect from 'react-native-picker-select';
import Toast from "react-native-toast-message";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Add this import

import mime from "mime";

import baseURL from "../../../../assets/common/baseurl";

const PharmacyOwnerSignupScreen = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState(null);
  const [barangays, setBarangays] = useState([]);
  const [city, setCity] = useState("Taguig City");
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch barangay list from API
    axios.get(`${baseURL}barangays`)
      .then(response => {
        const barangayData = response.data.map(barangay => ({
          label: barangay.name,
          value: barangay.name,
        }));
        setBarangays(barangayData);
      })
      .catch(error => {
        console.error("Error fetching barangays:", error);
        setError("Failed to load barangay list");
      });

    // Request image picker permissions
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          alert("We need access to your camera roll to upload images!");
        }
      }
    })();
  }, []);


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [5.5, 8.5],
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
    if (!contactNumber) errorMessages.contactNumber = "CONTACT NUMBER IS REQUIRED";
    if (!password) errorMessages.password = "PASSWORD IS REQUIRED";
    if (!street) errorMessages.street = "STREET IS REQUIRED";
    if (password.length < 8 & password.length > 0) errorMessages.password = "PASSWORD MUUST BE ATLEAST 8 CHARACTERS";
    if (contactNumber.length !== 11) errorMessages.contactNumber = "CONTACT NUMBER MUST BE 11 DIGITS";
    if (!barangay) errorMessages.barangay = "PLEASE SELECT YOUR BARANGAY";
    if (images.length === 0) errorMessages.images = "PLEASE UPLOAD AT LEAST ONE PERMIT";


    return errorMessages;
  };
  const register = () => {

    const validationErrors = validate();
    setError(validationErrors);

    let formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("contactNumber", contactNumber);
    formData.append("password", password);
    formData.append("street", street);
    formData.append("barangay", barangay);
    formData.append("city", city);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("isAdmin", false);
    formData.append("role", "PharmacyOwner");
    formData.append("approved", false);

    images.forEach((image, index) => {
      formData.append(`images`, {
        uri: image.uri,
        type: mime.getType(image.uri),
        name: `image${index}.${mime.getExtension(mime.getType(image.uri))}`,
      });
    });

    const config = {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    };

    axios.post(`${baseURL}users/register`, formData, config)
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          // Assuming the response has userId
          const userId = res.data.userId;
          console.log(res.data)
          // Show success message
          Toast.show({
            topOffset: 60,
            type: "success",
            text1: "REGISTRATION SUCCEEDED",
            text2: "PLEASE LOG IN TO YOUR ACCOUNT",
          });

          // Redirect to OTP verification screen and pass userId as a parameter
          setTimeout(() => {
            router.push({
              pathname: '/screens/Auth/OTPVerification/VerifyOTP',
              params: { userId }, // Pass userId to OTP screen
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
              text2: "PLEASE TRY AGAIN LATER",
            });
          }
        } else {
          Toast.show({
            type: "error",
            text1: "NETWORK ERROR!",
            text2: "PLEASE CHECK YOU INTERNAT CONNECTION AND TRY AGAIN",
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
      <Text style={styles.title}>Sign Up as Pharmacy Owner</Text>

      {/* Input Fields */}
      <View style={styles.inputSection}>
        <TextInput style={styles.input} placeholder="Pharmacy name" placeholderTextColor="#AAB4C1" value={name} onChangeText={setName} />
        {error.name && <Text style={styles.errorText}>{error.name}</Text>}

        <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#AAB4C1" keyboardType="email-address" value={email} onChangeText={setEmail} />
        {error.email && <Text style={styles.errorText}>{error.email}</Text>}


        <TextInput style={styles.input} placeholder="Contact number" placeholderTextColor="#AAB4C1" value={contactNumber} onChangeText={setContactNumber} keyboardType="phone-pad" />
        {error.contactNumber && <Text style={styles.errorText}>{error.contactNumber}</Text>}

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
        {error.password && <Text style={styles.errorText}>{error.password}</Text>}

        {/* Address Fields */}
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Street"
            placeholderTextColor="#AAB4C1"
            value={street}
            onChangeText={setStreet}
          />
          <RNPickerSelect
            onValueChange={(value) => setBarangay(value)}
            items={barangays}
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
          </View>

        <View style={styles.rowValidation}>

          {error.street && <Text style={styles.errorAddress}>{error.street}</Text>}
          {error.barangay && <Text style={styles.errorAddress}>{error.barangay}</Text>}
        </View>
        
        
        <TextInput style={styles.input} placeholder="City" placeholderTextColor="#AAB4C1" value={city} editable={false} />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Latitude"
            placeholderTextColor="#AAB4C1"
            keyboardType="numeric"
            value={latitude}
            onChangeText={setLatitude}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Longitude"
            placeholderTextColor="#AAB4C1"
            keyboardType="numeric"
            value={longitude}
            onChangeText={setLongitude}
          />
        </View>
        
        {/* Upload Permits UI */}
        <Text style={styles.uploadLabel}>Upload Permits</Text>
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
            <Text style={styles.uploadButtonText}>Select Images</Text>
          </TouchableOpacity>
        </View>
        {error.images && <Text style={styles.errorImages}>{error.images}</Text>}



        {/* Sign up Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={() => register()}>
          <Text style={styles.signUpButtonText}>Sign up</Text>
        </TouchableOpacity>
      </View>

      {/* Login Text */}
      <Text style={styles.loginText}>
        Already have an account?{' '}
        <Text onPress={() => router.push('/screens/Auth/LoginScreen')} style={styles.loginLink}>
          Login
        </Text>
      </Text>
    </KeyboardAwareScrollView>
  );
};

export default PharmacyOwnerSignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  inputPass: {
    paddingLeft: 12,
    borderRadius: 8,
    marginVertical: 10,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 10,
    paddingRight: 10,
    backgroundColor: '#F2F2F2',
  },
  eyeIcon: {
    padding: 9,
    paddingRight: 5,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 0,
  },
  rowValidation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 0,
  },
  halfInput: {
    width: '48%',
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
  errorAddress: {
    color: 'red',
    fontSize: 12,
    marginTop: -2,
    marginBottom: 10,
    textAlign: 'center', 
  },
});

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