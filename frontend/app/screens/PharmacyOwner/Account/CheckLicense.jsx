import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { Modal, FlatList } from 'react-native';

import baseURL from "../../../../assets/common/baseurl";

const CheckLicense = () => {
  const [inputDetail, setInputDetail] = useState('');
  const [identifier, setIden] = useState('');
  const [matchedPharmacies, setMatchedPharmacies] = useState([]);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  const router = useRouter();

  const normalizeString = (str) => {
    return str.toLowerCase().replace(/[\s-]/g, ''); // Remove spaces & dashes, make lowercase
  };

  function convertToISO(dateStr) {
    const [day, monStr, yearSuffix] = dateStr.split("-");
    const months = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04",
      May: "05", Jun: "06", Jul: "07", Aug: "08",
      Sep: "09", Oct: "10", Nov: "11", Dec: "12",
    };
    const year = "20" + yearSuffix; // assumes year is 20xx
    const month = months[monStr];
    return `${year}-${month}-${day.padStart(2, '0')}`;
  }

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

      // Fetch pharmacies data
      const res = await axios.get(`${baseURL}pharmacies/json`);
      const pharmacies = res.data;

      // console.log("Fetched Response:", pharmacies); // Debugging

      const normalizedIdentifier = normalizeString(inputDetail);
      const matched = pharmacies.filter((pharmacy) =>
        normalizeString(pharmacy.licenseNumber) === normalizeString(inputDetail) ||
        normalizeString(pharmacy.pharmacyName) === normalizedIdentifier
      );

      if (matched.length === 1) {
        const pharmacy = matched[0];
        const rawExpiry = pharmacy.expiryDate; // e.g. "22-May-25"
        const isoDateStr = convertToISO(rawExpiry);
        const expiryDate = new Date(isoDateStr);
        const today = new Date();

        expiryDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        console.log("Converted Expiry Date:", expiryDate.toISOString());
        console.log("Today's Date:", today.toISOString());

        if (expiryDate < today) {
          Toast.show({
            topOffset: 60,
            type: "error",
            text1: "LICENSE EXPIRED",
            text2: "Your license has expired. Please renew your license.",
          });
          return;
        }


        const pharmacyName = pharmacy.pharmacyName;
        Toast.show({
          topOffset: 60,
          type: "success",
          text1: "PHARMACY FOUND",
          text2: "Redirecting to Registration.",
        });

        setTimeout(() => {
          router.push({
            pathname: '/screens/PharmacyOwner/Account/PharmacyOwnerSignupScreen',
            params: { pharmacyName },
          });
        }, 500);
      }
      else if (matched.length > 1) {
        setMatchedPharmacies(matched);
        setAddressModalVisible(true);
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

      {addressModalVisible && (
        <Modal transparent visible={addressModalVisible} animationType="slide">
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#000000aa' }}>
            <View style={{ backgroundColor: '#005b7f', margin: 20, padding: 20, borderRadius: 10 }}>
              <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>Select Branch</Text>
              {matchedPharmacies.map((pharmacy, index) => (
                <TouchableOpacity
                  key={index}
                  style={{ paddingVertical: 10 }}
                  onPress={() => {
                    const rawExpiry = pharmacy.expiryDate;
                    const isoDateStr = convertToISO(rawExpiry);
                    const expiryDate = new Date(isoDateStr);
                    const today = new Date();

                    expiryDate.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);

                    if (expiryDate < today) {
                      Toast.show({
                        topOffset: 60,
                        type: "error",
                        text1: "LICENSE EXPIRED",
                        text2: `The license for this branch has expired. Please renew the license.`,
                      });
                      return;
                    }

                    setAddressModalVisible(false);
                    router.push({
                      pathname: '/screens/PharmacyOwner/Account/PharmacyOwnerSignupScreen',
                      params: { pharmacyName: pharmacy.pharmacyName },
                    });
                  }}

                >
                  <Text style={styles.branches}>{pharmacy.address}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

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
    backgroundColor: '#005b7f',
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
  branches: {
    borderWidth: 1,
    borderColor: '#B0B0B0',
    padding: 10,
    borderRadius: 8,
    marginVertical: 0,
    fontSize: 16,
    color: 'white'
  },
  submitButton: {
    backgroundColor: '#005b7f',
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
