import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Toast from 'react-native-toast-message'; 
import baseURL from "../../../../assets/common/baseurl";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      if (!email) {
        Toast.show({
          topOffset: 60,
          type: 'error',
          text1: 'EMAIL IS REQUIRED!',
          text2: 'Please input your email.',
        });
        return;
      }
  
      // Fetch user data by email
      const res = await axios.post(`${baseURL}users/checkEmail`, { email });
  
      console.log("Fetched Response:", res.data); // Log the response for debugging
  
      if (res.data.exists) {
        if (res.data.otpStatus === 'PENDING') {
          Toast.show({
            topOffset: 60,
            type: "success",
            text1: "EMAIL EXISTS",
            text2: "Redirecting to OTP verification.",
          });
  
          // Redirect to VerifyOTP screen with the userId
          setTimeout(() => {
            router.push({
              pathname: '/screens/Auth/ForgotPassword/ResetOTP',
              params: { userId: res.data.userId },
            });
          }, 500);
        } else {
          // Handle OTP not sent or other issues
          Toast.show({
            topOffset: 60,
            type: "error",
            text1: "OTP ERROR",
            text2: "Something went wrong while sending OTP.",
          });
        }
      } else {
        Toast.show({
          topOffset: 60,
          type: "error",
          text1: "EMAIL NOT FOUND!",
          text2: "Please register first.",
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
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subText}>
          Enter your email address to reset your password. We’ll send you an email for OTP.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#AAB4C1"
          value={email}
          onChangeText={setEmail}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
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

export default ForgotPasswordScreen;
