import React from 'react'; 
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const PharmacyOwnerSignupScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
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
        <TextInput style={styles.input} placeholder="Pharmacy name" placeholderTextColor="#AAB4C1" />
        <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#AAB4C1" keyboardType="email-address" />
        
        {/* Address Fields */}
        <TextInput style={styles.input} placeholder="Street" placeholderTextColor="#AAB4C1" />
        <TextInput style={styles.input} placeholder="Barangay" placeholderTextColor="#AAB4C1" />
        <TextInput style={styles.input} placeholder="City" placeholderTextColor="#AAB4C1" />

        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#AAB4C1" secureTextEntry={true} />
        <TextInput style={styles.input} placeholder="Confirm password" placeholderTextColor="#AAB4C1" secureTextEntry={true} />

        {/* Upload Permits UI */}
        <Text style={styles.uploadLabel}>Upload Permits</Text>
        <View style={styles.uploadContainer}>
          <TouchableOpacity style={styles.uploadButton}>
            <Ionicons name="image-outline" size={24} color="white" />
            <Text style={styles.uploadButtonText}>Select Images</Text>
          </TouchableOpacity>
        </View>

        {/* Sign up Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={() => router.push('/screens/Auth/LoginScreen')}>
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
    </View>
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
    marginVertical: 10,
    justifyContent: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#027DB1',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
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
