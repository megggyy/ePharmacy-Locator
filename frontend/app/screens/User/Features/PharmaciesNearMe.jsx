import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For icons
import { useRouter } from 'expo-router';

const PharmaciesNearMe = () => {
  const router = useRouter();

  return (
    <View style={styles.topContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Pharmacies Near Me</Text>
      </View>
      <ScrollView style={styles.container}>
        {/* Pharmacies Section */}
        <Text style={styles.sectionTitle}>Available Pharmacies</Text>
        {Array.from({ length: 6 }).map((_, index) => (
          <TouchableOpacity key={index} style={styles.pharmacyCard} onPress={() => router.push('/screens/User/Features/PharmacyDetails')}>
            <Image
              style={styles.pharmacyImage}
              source={require('@/assets/images/sample.jpg')}
            />
            <View style={styles.pharmacyInfo}>
              <Text style={styles.pharmacyName}>Pharmacy Name {index + 1}</Text>
              <Text style={styles.pharmacyAddress}>123 Main St, City {index + 1}</Text>
              <Text style={styles.pharmacyBarangay}>Sample Barangay {index + 1}</Text>
              <Text style={styles.storeHours}>8 AM - 10 PM</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background
  },
  header: {
    backgroundColor: '#0B607E', // Dark header background
    paddingTop: 60,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  container: { 
    flex: 1, 
    paddingHorizontal: 16, 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginTop: 20, 
    marginBottom: 10, 
    color: '#0B607E' 
  },
  pharmacyCard: { 
    flexDirection: 'row', // Row layout for pharmacy card
    padding: 10,
    backgroundColor: '#fff', 
    borderRadius: 12, // Slightly larger border radius
    marginVertical: 10,
    elevation: 4, // Adding shadow effect
    borderColor: '#B0BEC5', // Light border color
    borderWidth: 1, // Border width
  },
  pharmacyImage: { 
    width: 80, // Set a fixed width for the image
    height: 80, // Set a fixed height for the image
    borderRadius: 10, 
    marginRight: 10, // Space between image and text
  },
  pharmacyInfo: {
    flex: 1, // Allow info section to take up remaining space
    justifyContent: 'center', // Center align text vertically
  },
  pharmacyName: { 
    fontSize: 16, 
    fontWeight: 'bold',
    color: '#333',
  },
  pharmacyAddress: { 
    fontSize: 14, 
    color: '#555', 
    marginBottom: 5 
  },
  pharmacyBarangay: {
    fontSize: 14,
    color: '#777',
    marginBottom: 5,
  },
  storeHours: {
    fontSize: 12,
    color: '#999',
  },
});

export default PharmaciesNearMe;
