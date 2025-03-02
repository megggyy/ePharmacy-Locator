import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import baseURL from "../../../../assets/common/baseurl";

const CheckLicense = () => {
  const [inputDetail, setInputDetail] = useState('');
  const [identifier, setIden] = useState('');

  const router = useRouter();

  const normalizeString = (str) => {
    return str.toLowerCase().replace(/[\s-]/g, ''); // Remove spaces & dashes, make lowercase
  };
  
  const handleSubmit = async () => {
    try {
      if (!inputDetail) {
        Toast.show({
          topOffset: 60,
          type: 'error',
          text1: 'INPUT REQUIRED!',
          text2: 'Please enter your pharmacy name or license number.',
        });
        return;
      }
  
      // Normalize input
      const normalizedIdentifier = normalizeString(inputDetail);
  
      // Fetch pharmacies data
      const res = await axios.get(`${baseURL}pharmacies/json`);
      const pharmacies = res.data;
  
      console.log("Fetched Response:", pharmacies); // Debugging
  
      // Find matching pharmacy
      const matchedPharmacy = pharmacies.find((pharmacy) => 
        normalizeString(pharmacy.licenseNumber) === normalizedIdentifier ||
        normalizeString(pharmacy.pharmacyName) === normalizedIdentifier
      );
  
      if (matchedPharmacy) {
        const pharmacyName = matchedPharmacy.pharmacyName; // Always pass pharmacyName
  
        console.log('pharmacy', pharmacyName)
        Toast.show({
          topOffset: 60,
          type: "success",
          text1: "PHARMACY FOUND",
          text2: "Redirecting to Registration.",
        });
  
        setTimeout(() => {
          router.push({
            pathname: '/screens/PharmacyOwner/Account/PharmacyOwnerSignupScreen',
            params: { pharmacyName }, // Pass pharmacyName instead of identifier
          });
        }, 500);
      } else {
        Toast.show({
          topOffset: 60,
          type: "error",
          text1: "PHARMACY NOT FOUND!",
          text2: "Try inputting license number instead.",
        });
      }
    } catch (error) {
      console.error("Error Occurred:", error.response?.data || error.message);
      Toast.show({
        topOffset: 60,
        type: "error",
        text1: "SOMETHING WENT WRONG!",
        text2: "Please try again later.",
      });
    }
  };
  
  



  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      {/* Upper Section */}
      <View style={styles.upperSection}>
        <Image source={require('@/assets/images/epharmacy-logo.png')} style={styles.icon} />
        <Text style={styles.appName}>ePharmacy</Text>
      </View>

      {/* Lower Section */}
      <View style={styles.lowerSection}>
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subText}>
          Please enter your pharmacy name or license number to verify its licensing status as per the FDA records.
        </Text>
        <TextInput
          style={styles.input}
          value={inputDetail}
          onChangeText={setInputDetail}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Check</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.backToLogin} onPress={() => router.push('/screens/Auth/LoginScreen')}>
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  upperSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A6A83',
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appName: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },
  lowerSection: {
    flex: 3,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#B0B0B0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4A8691',
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
  },
  backToLogin: {
    fontSize: 14,
    color: '#357B8E',
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default CheckLicense;
