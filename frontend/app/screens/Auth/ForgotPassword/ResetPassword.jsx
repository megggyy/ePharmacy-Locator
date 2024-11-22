import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For the back icon
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import AuthGlobal from '@/context/AuthGlobal';
import baseURL from "../../../../assets/common/baseurl";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

const ResetPassword = () => {
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState('');
  const [loading, setLoading] = useState(false);
  const { dispatch } = useContext(AuthGlobal);
  const [showPassword1, setShowPassword1] = useState(false); // New state for password visibility
  const [showPassword2, setShowPassword2] = useState(false); // New state for password visibility

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      setUserId(storedUserId); // Set userId from AsyncStorage
    };
    fetchUserId();
  }, []);

  const validate = () => {
    let errorMessages = {};
    if (!newPassword) errorMessages.newPassword = "PASSWORD IS REQUIRED";
    if (!confirmPassword) errorMessages.confirmPassword = "PASSWORD IS REQUIRED";
    if (!confirmPassword < 8 & !confirmPassword > 0) errorMessages.confirmPassword = "PASSWORD MUST BE ATLEAST 8 CHARACTERS";
    if (!newPassword < 8 & !newPassword > 0) errorMessages.confirmPassword = "PASSWORD MUUST BE ATLEAST 8 CHARACTERS";

    return errorMessages;
  };

  console.log('userId', userId)

  const handleUpdatePassword = async () => {

    const validationErrors = validate();
    setErrors(validationErrors);

    if (newPassword !== confirmPassword) {
      Toast.show({
        topOffset: 60,
        type: 'error',
        text1: 'PASSWORD DO NOT MATCH',
    });
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${baseURL}users/resetPassword`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (response.status === 200 || response.status === 201) {
        Toast.show({
          topOffset: 60,
          type: 'SUCCESS',
          text1: 'PASSWORD UPDATED',
          text2: 'PLEASE LOG IN AGAIN.',
      });
        try {
          await AsyncStorage.removeItem('jwt');
          dispatch({ type: 'LOGOUT_USER' });
          router.push('/screens/Auth/LoginScreen');
        } catch (errors) {
          console.error('Error during logout:', errors);
        }
      } else {
        setErrors(data.message);
      }
    } catch (errors) {
      Toast.show({
        topOffset: 60,
        type: 'error',
        text1: 'AN ERROR OCCURED',
        text2: 'PLEASE TRY AGAIN',
    });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button and Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Reset Password</Text>
      </View>

      {/* Input Fields Section */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry={!showPassword1} // Conditionally secure the password
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword1(!showPassword1)} style={styles.eyeIcon}>
            <Icon
              name={showPassword1 ? "eye-off" : "eye"}
              size={24}
              color="#AAB4C1"
            />
          </TouchableOpacity>
        </View>
        {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
      </View>



      <View style={styles.inputContainer}>
        <Text style={styles.label}>Re-type Password *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Re-type Password"
            secureTextEntry={!showPassword2} // Conditionally secure the password
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword2(!showPassword2)} style={styles.eyeIcon}>
            <Icon
              name={showPassword2 ? "eye-off" : "eye"}
              size={24}
              color="#AAB4C1"
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>
      

      {/* Update Password Button */}
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePassword} disabled={loading}>
        <Text style={styles.updateButtonText}>
          {loading ? 'Updating...' : 'Update Password'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    backgroundColor: '#0B607E',
    paddingTop: 80,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  headerText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    padding: 9,
    paddingRight: 5,
  },
  label: {
    color: '#666',
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#F4F4F4',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: 310,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  updateButton: {
    backgroundColor: '#0B607E',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 3,
    textAlign: 'center',
  },
});

export default ResetPassword;
