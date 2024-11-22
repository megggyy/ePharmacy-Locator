import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AuthGlobal from '@/context/AuthGlobal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import baseURL from '@/assets/common/baseurl';
import ViewProfile from '../screens/User/Profile/ViewProfileScreen';

const HomeScreen = () => {
  const { state } = useContext(AuthGlobal); // Get authentication state from context
  const [userData, setUserData] = useState(null); // User data for profile
  const router = useRouter();

  useEffect(() => {
    // Check if the user is logged in and fetch profile data
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        if (token) {
          const decoded = jwtDecode(token);
          const userId = decoded?.userId;
  
          if (userId) {
            const response = await fetch(`${baseURL}users/${userId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });
  
            if (!response.ok) throw new Error('FAILED TO FETCH USER PROFILE');
            const data = await response.json();
            setUserData(data); // Set user data for profile
          }
        }
      } catch (error) {
        Alert.alert('PLEASE LOG IN FIRST');
      }
    };
  
    fetchUserData();
  }, [state.isAuthenticated]); // Only fetch when the auth state changes
  

  if (state.isAuthenticated) {
    // If user is authenticated, show ViewProfile
    return <ViewProfile userData={userData} />;
  }

  // If user is not authenticated, show Welcome screen
  return (
    <View style={styles.container}>
      {/* Upper section with background color */}
      <View style={styles.upperSection}>
        <Image source={require('@/assets/images/epharmacy-logo.png')} style={styles.icon} />
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.appName}>ePharmacy</Text>
      </View>

      {/* Lower section with white background */}
      <View style={styles.lowerSection}>
        {/* Buttons */}
        <TouchableOpacity style={styles.button} onPress={() => router.push('../screens/Auth/LoginScreen')}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={() => router.push('../screens/Auth/SignupRoleScreen')}
        >
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    backgroundColor: '#0A6A83', // Blue background for the upper section
  },
  icon: {
    width: 100, // Adjust size accordingly
    height: 100,
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '400',
  },
  appName: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 40,
  },
  lowerSection: {
    flex: 1,
    backgroundColor: '#fff', // White background for the bottom section
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#4A8691', // Same color as the upper background
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 8,
    marginVertical: 10,
  },
  signupButton: {
    backgroundColor: '#357B8E', // Different color for Sign up button
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default HomeScreen;
