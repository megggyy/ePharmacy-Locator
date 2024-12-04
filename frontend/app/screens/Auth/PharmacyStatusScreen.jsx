import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AuthGlobal from '@/context/AuthGlobal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import baseURL from '@/assets/common/baseurl';

const PharmacyReviewScreen = () => {
  const { state } = useContext(AuthGlobal); // Get authentication state from context 
  const router = useRouter();


  return (
    <View style={styles.container}>
      {/* Upper section with background color */}
      <View style={styles.upperSection}>
        <Image source={require('@/assets/images/epharmacy-logo.png')} style={styles.icon} />
        <Text style={styles.welcomeText}>Pharmacy Application Status</Text>
      </View>

      {/* Lower section with white background */}
      <View style={styles.lowerSection}>
        <Text style={styles.messageText}>
          Your Pharmacy Application is still under review. Kindly wait for the email that will say your pharmacy is approved. For now, you can browse as customer.
        </Text>

        {/* Go Home Button */}
        <TouchableOpacity style={styles.goHomeButton} onPress={() => router.push('/')}>
          <Text style={styles.buttonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  upperSection: {
    flex: 1, // Take up one-third of the screen
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A6A83', // Blue background for the upper section
  },
  icon: {
    width: 100, // Adjust size accordingly
    height: 100,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '400',
  },
  lowerSection: {
    flex: 2, // Takes the remaining two-thirds of the screen
    backgroundColor: '#fff', // White background for the bottom section
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginVertical: 20,
  },
  goHomeButton: {
    backgroundColor: '#4A8691',
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default PharmacyReviewScreen;
