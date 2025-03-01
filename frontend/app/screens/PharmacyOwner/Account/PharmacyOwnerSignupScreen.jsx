import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import Toast from "react-native-toast-message";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location"; // Import Expo Location
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Add this import
import DateTimePicker from '@react-native-community/datetimepicker';

import MapView, { Marker } from 'react-native-maps';  // Import MapView and Marker

import mime from "mime";

import baseURL from "../../../../assets/common/baseurl";

const PharmacyOwnerSignupScreen = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const { pharmacyName } = useLocalSearchParams();
  const [name, setName] =  useState(pharmacyName || "");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [region, setRegion] = useState({
    latitude: 14.520445,
    longitude: 121.053886,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState(null);
  const [barangays, setBarangays] = useState([]);
  const [city, setCity] = useState("Taguig City");
  const [images, setImages] = useState([]);
  const [permits, setPermit] = useState([]);
  const [error, setError] = useState('');
  const [businessDays, setBusinessDays] = useState("");
  const [openingHour, setOpeningHour] = useState(new Date());
  const [closingHour, setClosingHour] = useState(new Date());
  const [showOpeningTime, setShowOpeningTime] = useState(false);
  const [showClosingTime, setShowClosingTime] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const CustomCheckBox = ({ value, onValueChange }) => {
    return (
      <TouchableOpacity
        onPress={() => onValueChange(!value)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 8,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: value ? '#007BFF' : '#AAB4C1',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: value ? '#007BFF' : 'transparent',
          }}
        >
          {value && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

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

    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          alert("We need access to your camera roll to upload images!");
        }
      }
    })();

    getCurrentLocation();
    setName(pharmacyName)
  }, [pharmacyName]);

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
      aspect: [5.5, 8.5],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map((asset) => ({ id: images.length, uri: asset.uri }));
      const filteredImages = images.filter(image => image.uri !== undefined);
      setImages([...filteredImages, ...selectedImages]);
    }
  };

  const pickPermit = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [5.5, 8.5],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedPermits = result.assets.map((asset) => ({ id: permits.length, uri: asset.uri }));
      const filteredPermits = permits.filter(image => image.uri !== undefined);
      setPermit([...filteredPermits, ...selectedPermits]);
    }
  };


  const removeImage = (id) => {
    setImages(images.filter((image) => image.id !== id));
  };

  const removePermit = (id) => {
    setPermit(permits.filter((permit) => permit.id !== id));
  };

  const validate = () => {
    let errorMessages = {};
    if (!name) errorMessages.name = "NAME IS REQUIRED";
    if (!email) errorMessages.email = "EMAIL IS REQUIRED";
    if (!contactNumber) {
      errorMessages.contactNumber = "CONTACT NUMBER IS REQUIRED";
    } else if (contactNumber.length !== 11) {
      errorMessages.contactNumber = "MUST BE 11 CHARACTERS";
    }
    if (!password) {
      errorMessages.password = "PASSWORD IS REQUIRED";
    } else if (password.length < 8) {
      errorMessages.password = "MUST BE AT LEAST 8 CHARACTERS";
    }
    if (!street) errorMessages.street = "STREET IS REQUIRED";
    if (!barangay) errorMessages.barangay = "PLEASE SELECT YOUR BARANGAY";
    if (images.length === 0) errorMessages.images = "PLEASE UPLOAD AT LEAST ONE PERMIT";
    if (permits.length === 0) errorMessages.permits = "PLEASE UPLOAD YOUR BUSINESS PERMIT";
    if (!businessDays) errorMessages.businessDays = "PLEASE SELECT BUSINESS DAYS";
    if (!openingHour || !closingHour) errorMessages.hours = "PLEASE SELECT OPENING AND CLOSING HOURS";
    if (!agreedToTerms) errorMessages.terms = 'YOU MUST AGREE TO THE TERMS AND CONDITIONS';
    return errorMessages;
  };
  const register = () => {

    const validationErrors = validate();
    setError(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;


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
    formData.append("businessDays", businessDays);
    formData.append("openingHour", openingHour.toISOString());
    formData.append("closingHour", closingHour.toISOString());
    console.log(openingHour.toISOString());
    console.log(closingHour.toISOString());


    images.forEach((image, index) => {
      formData.append(`images`, {
        uri: image.uri,
        type: mime.getType(image.uri),
        name: `image${index}.${mime.getExtension(mime.getType(image.uri))}`,
      });
    });

    // Append business permit
    permits.forEach((permit, index) => {
      formData.append("permits", {
        uri: permit.uri,
        type: mime.getType(permit.uri),
        name: `permit.${mime.getExtension(mime.getType(permit.uri))}`,
      });
    });
    console.log(formData);

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
            text1: "ACCOUNT CREATED",
            text2: "Please verify your email.",
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
            text2: "Please check your internet connection and try again.",
          });
        }
      });
  };

  const handleClose = (type) => {
    if (type === "opening") {
      setShowOpeningTime(false);
    } else if (type === "closing") {
      setShowClosingTime(false);
    }
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
        <TextInput style={styles.input} placeholder="Pharmacy name" placeholderTextColor="#AAB4C1" value={name} editable={false} />
        {error.name && <Text style={styles.errorText}>{error.name}</Text>}

        <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#AAB4C1" keyboardType="email-address" value={email} onChangeText={setEmail} />
        {error.email && <Text style={styles.errorText}>{error.email}</Text>}


        <View style={styles.row}>
          {/* Contact Number */}
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Contact number"
            placeholderTextColor="#AAB4C1"
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
          />
          {/* Password */}
          <View style={[styles.passwordContainer, styles.halfInput]}>
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
        </View>
        {/* Display Validation Errors */}
        <View style={styles.rowValidation}>
          {error.contactNumber && <Text style={styles.errorAddress}>{error.contactNumber}</Text>}
          {error.password && <Text style={styles.errorAddress}>{error.password}</Text>}
        </View>


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
            value={barangay}
          />
        </View>

        <View style={styles.rowValidation}>

          {error.street && <Text style={styles.errorAddress}>{error.street}</Text>}
          {error.barangay && <Text style={styles.errorAddress}>{error.barangay}</Text>}

        </View>

        <TextInput style={styles.inputCity} placeholder="City" placeholderTextColor="#AAB4C1" value={city} editable={false} />

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

        {/* Business Days Input as a simple text */}
        <TextInput
          style={styles.input}
          placeholder="Enter business days                                                            "
          placeholderTextColor="#AAB4C1"
          value={businessDays}
          onChangeText={setBusinessDays}
        />
        {error.businessDays && <Text style={styles.errorText}>{error.businessDays}</Text>}

        {/* Opening and Closing Hours Section */}
        <View style={styles.row}>
          {/* Opening Hour */}
          <TouchableOpacity onPress={() => setShowOpeningTime(true)} style={[styles.input, styles.timeInput]}>
            <Text>{`Opening: ${openingHour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</Text>
          </TouchableOpacity>
          {showOpeningTime && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={openingHour}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  if (event.type === 'set') { // Check if the user set a time
                    setOpeningHour(selectedDate || openingHour); // Update time
                  }
                  setShowOpeningTime(false); // Close the picker after a selection or cancel
                }}
              />
              <TouchableOpacity onPress={() => handleClose("opening")} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
          )}


          {/* Closing Hour */}
          <TouchableOpacity onPress={() => setShowClosingTime(true)} style={[styles.input, styles.timeInput]}>
            <Text>{`Closing: ${closingHour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</Text>
          </TouchableOpacity>
          {showClosingTime && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={closingHour}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  if (event.type === 'set') { // Only handle when a valid time is selected
                    setClosingHour(selectedDate || closingHour);
                  }
                  setShowClosingTime(false); // Close the picker
                }}
              />
              <TouchableOpacity onPress={() => setShowClosingTime(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
          )}

        </View>

        {/* Upload Pharmacy Image */}
        <Text style={styles.uploadLabel}>Pharmacy Image</Text>
        <View style={styles.uploadContainer}>
          <TextInput
            style={styles.inputTextField}
            placeholder="Select pharmacy images"
            editable={false}
            value={images.length > 0 ? 'Images Selected' : ''}
          />
          <TouchableOpacity style={styles.addIcon} onPress={pickImage}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Display Images */}
        <View style={styles.imagePreviewContainer}>
          {images.map((imageURL, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image style={styles.image} source={{ uri: imageURL.uri }} />
              <TouchableOpacity onPress={() => removeImage(imageURL.id)} style={styles.removeButton}>
                <Ionicons name="close" size={12} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {error.images && <Text style={styles.errorText}>{error.images}</Text>}

        {/* Upload Business Permit */}
        <Text style={styles.uploadLabel}>Business Permit</Text>
        <View style={styles.uploadContainer}>
          <TextInput
            style={styles.inputTextField}
            placeholder="Select business permits"
            editable={false}
            value={permits.length > 0 ? 'Permit Selected' : ''}
          />
          <TouchableOpacity style={styles.addIcon} onPress={pickPermit}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Display Permits */}
        <View style={styles.imagePreviewContainer}>
          {permits.map((permitURL, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image style={styles.image} source={{ uri: permitURL.uri }} />
              <TouchableOpacity onPress={() => removePermit(permitURL.id)} style={styles.removeButton}>
                <Ionicons name="close" size={12} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        {error.permits && <Text style={styles.errorText}>{error.permits}</Text>}

        <View style={styles.checkboxContainer}>
          <CustomCheckBox
            value={agreedToTerms}
            onValueChange={(newValue) => setAgreedToTerms(newValue)}
          />
          <Text style={styles.label}>
            I agree to the
            <Text style={styles.link} onPress={() => setIsTermsOpen(true)}>
              {' Terms and Conditions'}
            </Text>
          </Text>
        </View>

        {error.terms && <Text style={styles.errorText}>{error.terms}</Text>}
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
      <Modal
        visible={isTermsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsTermsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pharmacy Owner Terms and Conditions</Text>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalText}>
                Welcome to ePharmacy Locator. By using our service, you agree to the following terms:
              </Text>
              <Text style={styles.modalText}>
                By signing up as a Pharmacy Owner, you agree to the following terms:
              </Text>
              <Text style={styles.listItem}>
                • You are required to upload your valid business permit, which will be subject to approval by the admins.
              </Text>
              <Text style={styles.listItem}>
                • Your account must be verified before access is granted to the platform. An email will be sent once approved.
              </Text>
              <Text style={styles.listItem}>
                • Once approved, you will be able to pin your pharmacy location on the map and provide your pharmacy's address for users to find.
              </Text>
              <Text style={styles.listItem}>
                • You will manage your own medicines, including adding, editing, and deleting them as necessary.
              </Text>
              <Text style={styles.listItem}>
                • You will update your stock regularly. The stock update details, including the last update time, will be visible to users for transparency.
              </Text>
              <Text style={styles.listItem}>
                • As a Pharmacy Owner, you are responsible for keeping your pharmacy's information accurate and up to date.
              </Text>
              <Text style={styles.listItem}>
                • You are responsible for managing your profile and editing your details as needed.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setAgreedToTerms(true);
                setIsTermsOpen(false);
              }}
            >
              <Text style={styles.closeButtonText}>I Agree</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </KeyboardAwareScrollView>
  );
};

export default PharmacyOwnerSignupScreen;

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
    width: 70,
    height: 70,
    marginBottom: 5,
    marginTop: 15,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  inputSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
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
    marginVertical: 8,
    fontSize: 16,
    color: '#333',
  },
  inputCity: {
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
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 6,
    paddingRight: 10,
    backgroundColor: '#F2F2F2',
  },
  eyeIcon: {
    paddingRight: 5,
  },
  signUpButton: {
    backgroundColor: '#027DB1',
    paddingVertical: 9,
    borderRadius: 10,
    marginVertical: 8,
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
    marginBottom: 0,
  },
  rowValidation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 0,
  },
  halfInput: {
    width: '49%'
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
  timeInput: {
    flex: 0.48,
  },
  pickerContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    padding: 5,
  },
  uploadLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 2,
  },
  uploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 0,
    justifyContent: 'space-between',
  },
  inputTextField: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    padding: 8,
    fontSize: 16,
    color: '#333',
  },
  addIcon: {
    backgroundColor: '#027DB1',
    borderRadius: 30,
    padding: 5,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 1,
    justifyContent: 'flex-start',
  },
  imageContainer: {
    position: 'relative',
    margin: 5,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
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
    width: '49%',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  // modal
  modalContainer: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  link: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalBody: {
    maxHeight: 300,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  listItem: {
    marginLeft: 20,
    marginVertical: 2,
    fontSize: 14,
    color: '#4A4A4A',
  },
  bold: {
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
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
    flex: 1, // Ensures equal width with TextInput
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden', // Prevents overflow if picker content is larger
    backgroundColor: '#f9f9f9',
    paddingVertical: 0,
    paddingHorizontal: "24%",
    fontSize: 16,
    color: '#333',
  },
});