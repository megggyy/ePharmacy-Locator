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
import mime from "mime";

import baseURL from "../../../../assets/common/baseurl";

const PharmacyOwnerSignupScreen = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState(null);
  const [city, setCity] = useState("Taguig City");
  const [permits, setPermits] = useState([]);
  const [error, setError] = useState('');
  
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          alert("Apologies, but in order to proceed, we require permission to access your camera roll!");
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
      const selectedImages = result.assets.map((asset) => ({ id: permits.length, uri: asset.uri }));
      const filteredImages = permits.filter(image => image.uri !== undefined);
      setPermits([...filteredImages, ...selectedImages]);
    }
  };

  const removeImage = (id) => {
    setPermits(permits.filter((image) => image.id !== id));
  };

  const register = () => {
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

    permits.forEach((image, index) => {
      formData.append(`permits`, {
        uri: image.uri,
        type: mime.getType(image.uri),
        name: `image${index}.${mime.getExtension(mime.getType(image.uri))}`,
      });
    });

    console.log(formData)
    const config = {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    };

    axios.post(`${baseURL}users/register`, formData, config)
      .then((res) => {
        console.log('Response:', res);
        if (res.status === 200 || res.status === 201) {
          Toast.show({
            topOffset: 60,
            type: "SUCCESS",
            text1: "REGISTRATION SUCCEEDED",
            text2: "PLEASE LOG IN TO YOUR ACCOUNT",
          });
          setTimeout(() => {
            router.push('../../Auth/LoginScreen');
          }, 500);
        }
      })
      .catch((error) => {
        console.log('Response data:', error.response.data);
        Toast.show({
          topOffset: 60,
          type: "error",
          text1: "Something went wrong",
          text2: "Please try again"
        });
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
        <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#AAB4C1" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Contact number" placeholderTextColor="#AAB4C1" value={contactNumber} onChangeText={setContactNumber} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#AAB4C1" value={password} onChangeText={setPassword} secureTextEntry={true} />
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
          items={[
            { label: 'Central Signal', value: 'Central Signal' },
            { label: 'New Lower Bicutan', value: 'New Lower Bicutan' },
            { label: 'Hagonoy', value: 'Hagonoy' },
            { label: 'North Signal', value: 'North Signal' },
            { label: 'South Signal', value: 'South Signal' },
            { label: 'Tuktukan', value: 'Tuktukan' },
          ]}
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
          {permits.map((imageURL, index) => {
            return (
              <View key={index} style={styles.imageContainer}>
                <Image style={styles.image} source={{ uri: imageURL.uri }}/>
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
  halfInput: {
    width: '48%',
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