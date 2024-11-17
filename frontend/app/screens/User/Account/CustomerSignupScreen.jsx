import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'; 
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import RNPickerSelect from 'react-native-picker-select';
import Toast from "react-native-toast-message";
import axios from "axios";

import baseURL from "../../../../assets/common/baseurl";

const CustomerSignup = () => {
  const router = useRouter();
  
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [customDisease, setCustomDisease] = useState('');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState(null);
  const [city, setCity] = useState("Taguig City");
  const [diseases, setDiseases] = useState([]);
  const [barangays, setBarangays] = useState([]); // State to store barangays

  useEffect(() => {
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

    fetchDiseases();
    fetchBarangays(); // Call the fetch function for barangays
  }, []);

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
        diseases: selectedDisease === 'others' ? customDisease : selectedDisease,
        isAdmin: false,
        role: "Customer",
    };

    console.log(formData)
    try {
        const res = await axios.post(`${baseURL}users/register`, formData, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Handle the response
        if (res.status === 200) {
            Toast.show({
                topOffset: 60,
                type: "success",
                text1: "REGISTRATION SUCCEEDED",
                text2: "PLEASE LOG IN TO YOUR ACCOUNT",
            });
            setTimeout(() => {
              router.push('../../Auth/LoginScreen');
            }, 500);
        }
    } catch (error) {
        Toast.show({
            position: 'bottom',
            bottomOffset: 20,
            type: "error",
            text1: "SOMETHING WENT WRONG!",
            text2: "PLEASE TRY AGAIN",
        });
        console.log(error.message);
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
      <Text style={styles.title}>Sign Up as Customer</Text>

      {/* Input Fields */}
      <View style={styles.inputSection}>
        <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#AAB4C1" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#AAB4C1" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Contact number" placeholderTextColor="#AAB4C1" value={contactNumber} onChangeText={setContactNumber} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#AAB4C1" value={password} onChangeText={setPassword} secureTextEntry={true} />
        <TextInput style={styles.input} placeholder="Street" placeholderTextColor="#AAB4C1" value={street} onChangeText={setStreet} />
        
        {/* <RNPickerSelect
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
          value={barangay} // <-- ensure you pass the state value here
      /> */}
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
          value={barangay} // <-- ensure you pass the state value here
      />

        <TextInput style={styles.input} placeholder="City" placeholderTextColor="#AAB4C1" value={city} editable={false} />

        {/* Dropdown for diseases */}
        <RNPickerSelect
          onValueChange={(value) => {
            setSelectedDisease(value);
            if (value !== 'others') {
              setCustomDisease('');
            }
          }}
          items={diseases}
          style={pickerSelectStyles}
          placeholder={{
            label: 'Choose your disease',
            value: null,
            color: '#AAB4C1',
          }}
          Icon={() => {
            return <Ionicons name="chevron-down" size={24} color="#AAB4C1" />;
          }}
          useNativeAndroidPickerStyle={false}
          value={selectedDisease}
        />

        {/* Conditionally render TextInput for "Others" */}
        {selectedDisease === 'others' && (
          <TextInput
            style={styles.input}
            placeholder="Please Specify"
            placeholderTextColor="#AAB4C1"
            value={customDisease}
            onChangeText={setCustomDisease}
          />
        )}

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
