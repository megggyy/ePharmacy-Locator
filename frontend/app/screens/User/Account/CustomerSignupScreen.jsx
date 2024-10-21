import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from 'react-native-picker-select';
import Toast from "react-native-toast-message";
import axios from "axios";

import baseURL from "../../../../assets/common/baseurl";

const CustomerSignup = () => {
  const router = useRouter();
  const navigation = useNavigation();
  
  const [selectedStreet, setSelectedStreet] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [customDisease, setCustomDisease] = useState('');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [city, setCity] = useState("");
  const [diseases, setDiseases] = useState([]);

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

        formattedData.push({ label: 'Others', value: 'others' });

        setDiseases(formattedData);
      } catch (error) {
        console.error('Error fetching diseases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiseases(); // Call the fetch function
  }, []);

  // Register function (submit form data)
  const register = async () => {
    let formData = new FormData();
    
    formData.append("name", name);
    formData.append("email", email);
    formData.append("contactNumber", contactNumber);
    formData.append("password", password);
    formData.append("street", street);
    formData.append("barangay", barangay);
    formData.append("city", city);
    formData.append("diseases", selectedDisease === 'others' ? customDisease : selectedDisease);
    formData.append("isAdmin", false);
    formData.append("role", "Customer");

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    };

    try {
      const res = await axios.post(`${baseURL}users/register`, formData, config);
      if (res.status === 200) {
        Toast.show({
          topOffset: 60,
          type: "SUCCESS",
          text1: "REGISTRATION SUCCEEDED",
          text2: "PLEASE LOG IN TO YOUR ACCOUNT",
        });
        
        // If "Others" is selected, add the custom disease to the database
        if (selectedDisease === 'others' && customDisease.trim() !== '') {
          await addCustomDisease(customDisease);
        }

        setTimeout(() => {
          navigation.navigate("LoginScreen");
        }, 500);
      }
    } catch (error) {
      Toast.show({
        position: 'bottom',
        bottomOffset: 20,
        type: "error",
        text1: "Something went wrong",
        text2: "Please try again",
      });
      console.log(error.message);
    }
  };

  const addCustomDisease = async (diseaseName) => {
    try {
      await axios.post(`${baseURL}diseases/add`, { name: diseaseName });
      Toast.show({
        topOffset: 60,
        type: "SUCCESS",
        text1: "Custom Disease Added",
        text2: `${diseaseName} has been added to the database.`,
      });
    } catch (error) {
      console.error('Error adding custom disease:', error);
      Toast.show({
        position: 'bottom',
        bottomOffset: 20,
        type: "error",
        text1: "Failed to add custom disease",
        text2: "Please try again.",
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
        
        <RNPickerSelect
          onValueChange={(value) => setSelectedStreet(value)}
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
        />

        <TextInput style={styles.input} placeholder="City" placeholderTextColor="#AAB4C1" />

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
    </ScrollView>
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
