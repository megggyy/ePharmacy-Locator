import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Ensure Ionicons is installed in your project
import { useRouter } from 'expo-router';

const PrescriptionScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.safeArea}>
      {/* Header with back button and title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          {/* Back button icon with background */}
          <View style={styles.iconBackground}>
            <Ionicons name="arrow-back" size={24} color="#005b7f" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Uploaded Prescription</Text>
      </View>

      {/* Prescription Image */}
      <View style={styles.imageContainer}>
        <Image
            source={require('@/assets/images/sample.jpg')}// Path to the prescription image
          style={styles.prescriptionImage}
          resizeMode="contain"
        />
      </View>

      {/* Scan Now Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.scanButton}onPress={() => router.push('/screens/User/Features/PrescriptionResults')}>
          <Text style={styles.scanButtonText}>Scan Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 30,
    backgroundColor: '#005b7f', // Dark blue header background
  },
  backButton: {
    marginRight: 10,
  },
  iconBackground: {
    marginTop: 28,
    backgroundColor: 'white', // White background for arrow visibility
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    marginTop: 28,
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  prescriptionImage: {
    width: '100%',
    height: 500, // Adjust based on your image's size
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  scanButton: {
    width: 200,
    height: 50,
    backgroundColor: '#005b7f', // Dark blue for the button
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black', // Optional border for the button
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PrescriptionScreen;
