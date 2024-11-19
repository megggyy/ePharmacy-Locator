import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    // sa submit ng email
    console.log('Reset password request sent for:', email.trim());
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
          Enter your email address to reset your password. We’ll send you an email with instructions.
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
