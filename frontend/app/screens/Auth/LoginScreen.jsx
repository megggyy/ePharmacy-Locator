import React, { useState, useContext } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AuthGlobal from '../../../context/AuthGlobal';
import { loginUser } from '../../../context/AuthActions';
import { useRouter } from 'expo-router';
import Toast from "react-native-toast-message";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Add this import
import baseURL from "../../../assets/common/baseurl";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';

const LoginScreen = () => {
  const { state, dispatch } = useContext(AuthGlobal);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const router = useRouter();
  const [errors, setErrors] = useState({});

  const validate = () => {
    let errorMessages = {};
    if (!email) errorMessages.email = "EMAIL IS REQUIRED";
    if (!password) errorMessages.password = "PASSWORD IS REQUIRED"

    return errorMessages;
  };

const handleSubmit = async () => {
  const user = { email: email.trim(), password: password.trim() };

  const validationErrors = validate();
  setErrors(validationErrors);

  if (email === '' || password === '') {
    return;
  }
  const response = await loginUser(user, dispatch);

  console.log(response.message);
  if (response.message === "USER_NOT_VERIFIED") {
    const res = await axios.post(`${baseURL}users/checkEmail`, { email });
    router.push({
      pathname: '/screens/Auth/OTPVerification/VerifyOTP',
      params: { userId: res.data.userId },
    });
  }

  if (response.success) {
    const role = response.role; // Get role from login response
    switch (role) {
      case 'Customer':
        router.push('../../(tabs)'); // Redirect to Customer Home
        break;
  case 'PharmacyOwner':
  try {
    // Fetch the pharmacy details to check if it's approved
    const token = await AsyncStorage.getItem('jwt');
    const decoded = jwtDecode(token);
    const userId = decoded?.userId;

    const response = await fetch(`${baseURL}users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    const isApproved = data.pharmacyDetails?.approved;

    if (isApproved) {
      // Redirect to the dashboard if approved
      router.push('/screens/PharmacyOwner/Dashboard');
    } else {
      // Automatically log out if the pharmacy is not approved
      await AsyncStorage.removeItem('jwt');
      dispatch({ type: 'LOGOUT_USER' }); // Update global state to reflect logout
      Toast.show({
        topOffset: 60,
        type: 'error',
        text1: 'PHARMACY NOT APPROVED',
        text2: 'You have been logged out. Redirecting to approval status screen.',
      });

      // Redirect to Pharmacy Status Screen
      setTimeout(() => {
        router.push('/screens/Auth/PharmacyStatusScreen');
      }, 1500); // Small delay to ensure Toast message is visible
    }
  } catch (error) {
    console.error('Error fetching pharmacy status:', error);
    Toast.show({
      topOffset: 60,
      type: 'error',
      text1: 'ERROR',
      text2: 'Failed to fetch pharmacy status. Please try again.',
    });
  }
  break;
      case 'Admin':
        router.push('/screens/Admin/dashboard'); // Redirect to Admin Dashboard
        break;
      default:
        router.push('../../(tabs)'); // Fallback route
    }
    Toast.show({
      topOffset: 60,
      type: "success",
      text1: "LOGIN SUCCESSFUL",
    });
  } else {
    switch (response.message) {
      case "EMAIL_NOT_FOUND":
        Toast.show({
          topOffset: 60,
          type: "error",
          text1: "EMAIL IS NOT EXISTING",
          text2: "PLEASE CHECK YOUR EMAIL AND TRY AGAIN.",
        });
        break;
      case "USER_NOT_VERIFIED":
        Toast.show({
          topOffset: 60,
          type: "error",
          text1: "YOU'RE NOT VERIFIED",
          text2: "REDIRECTING TO VERIFICATION PAGE",
        });
        break;
      case "NETWORK_ERROR":
        Toast.show({
          topOffset: 60,
          type: "error",
          text1: "NETWORK ERROR",
          text2: "UNABLE TO CONNECT TO THE SERVER. PLEASE TRY AGAIN LATER",
        });
        break;
      case "INCORRECT_PASSWORD":
        Toast.show({
          topOffset: 60,
          type: "error",
          text1: "INCORRECT PASSWORD",
        });
        break;
      default:
        Toast.show({
          topOffset: 60,
          type: "error",
          text1: "LOGIN FAILED",
          text2: "AN UNEXPECTED ERROR OCCURRED. PLEASE TRY AGAIN LATER.",
        });
    }
  }
};

  
  
  

  AsyncStorage.getAllKeys((err, keys) => {
    AsyncStorage.multiGet(keys, (error, stores) => {
      stores.map((result, i, store) => {
        console.log({ [store[i][0]]: store[i][1] });
        return true;
      });
    });
  });

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <View style={styles.upperSection}>
        <Image source={require('@/assets/images/epharmacy-logo.png')} style={styles.icon} />
        <Text style={styles.appName}>ePharmacy</Text>
      </View>
      <View style={styles.lowerSection}>
        <Text style={styles.welcomeBackText}>Welcome back!</Text>
        <Text style={styles.subText}>Log in to your account</Text>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#AAB4C1"
          value={email}
          onChangeText={setEmail}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

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

        <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.forgotText} onPress={() => router.push('/screens/Auth/ForgotPassword/ForgotPassword')}>Forgot password?</Text>
        </TouchableOpacity>
        <Text style={styles.signupText}>
          Don’t have an account?{' '}
          <Text style={styles.signupLink} onPress={() => router.push('/screens/Auth/SignupRoleScreen')}>
            Signup
          </Text>
        </Text>
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
  welcomeBackText: {
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
  inputPass: {
    paddingLeft: 12,
    borderRadius: 8,
    marginVertical: 10,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B0B0B0',
    borderRadius: 8,
    marginVertical: 10,
    paddingRight: 10,
  },
  eyeIcon: {
    padding: 9,
    paddingRight: 5,
  },
  loginButton: {
    backgroundColor: '#4A8691',
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 8,
    marginVertical: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
  },
  forgotText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginVertical: 10,
  },
  signupText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  signupLink: {
    color: '#357B8E',
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -4,
    marginBottom: 5,
    textAlign: 'center',
  },
});

export default LoginScreen;
