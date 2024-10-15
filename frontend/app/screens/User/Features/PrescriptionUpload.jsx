import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Ensure Ionicons is installed in your project
import { useRouter } from 'expo-router';

const PrescriptionUploadScreen = () => {
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
        <Text style={styles.headerTitle}>RX scanner</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.container}>
      <Text style={styles.label}>Scan Prescription</Text>
        {/* Camera Button */}
        <TouchableOpacity style={styles.button}  onPress={() => router.push('/screens/User/Features/PrescriptionScan')}>
          <Ionicons name="camera-outline" size={60} color="white"  />
        </TouchableOpacity>
        <Text style={styles.label}>or</Text>
        <Text style={styles.label}>Upload Prescription</Text>

        {/* Upload Button */}
        <TouchableOpacity style={styles.button}  onPress={() => router.push('/screens/User/Features/PrescriptionScan')}>
          <Ionicons name="cloud-upload-outline" size={60} color="white"/>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff', // Background color similar to the image
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
    backgroundColor: 'white', // White background to make the arrow visible
    padding: 8,
    borderRadius: 20, // Circular background
  },
  headerTitle: {
    marginTop: 28,
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  container: {
    marginTop: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#005b7f', // Dark blue circle background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'black', // Optional border for the button
  },
  label: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default PrescriptionUploadScreen;
