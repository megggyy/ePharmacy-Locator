import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import baseURL from "../../../../assets/common/baseurl";

const VerifyOTPScreen = () => {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false); // To handle loading state

  const verifyOtp = async () => {
    if (!otp) {
      Toast.show({
        topOffset: 60,
        type: 'error',
        text1: 'OTP Required',
        text2: 'Please enter the OTP sent to your email.',
      });
      return;
    }

    setIsLoading(true); // Start loading
    try {
      const response = await fetch(`${baseURL}users/verifyOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await response.json();

      if (data.status === 'VERIFIED') {
        Toast.show({
          topOffset: 60,
          type: 'success',
          text1: 'OTP Verified',
          text2: 'Please wait for your account approval.',
        });

        setTimeout(() => {
          router.push('/(tabs)/account');
        }, 500);
      } else {
        throw new Error(data.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      Toast.show({
        topOffset: 60,
        type: 'error',
        text1: 'Verification Failed',
        text2: error.message || 'Please try again.',
      });
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Logo */}
      <Image
        source={require('@/assets/images/epharmacy-logo.png')}
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.title}>Enter OTP</Text>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <Text style={styles.infoText}>
          Please enter the 4-digit OTP sent to your registered email.
        </Text>

        {/* OTP Input */}
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          placeholderTextColor="#AAB4C1"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          maxLength={6}
        />

        {/* Verify Button */}
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={verifyOtp}
          disabled={isLoading} // Disable button while loading
        >
          <Text style={styles.verifyButtonText}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default VerifyOTPScreen;

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
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#027DB1',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
