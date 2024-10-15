import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Ensure Ionicons is installed in your project
import { useRouter } from 'expo-router';

const PrescriptionResultsScreen = () => {
  const router = useRouter();

  // Sample data for medicines
  const medicines = [
    { name: 'Paracetamol', quantity: 20 },
    { name: 'Paracetamol', quantity: 20 },
    { name: 'Paracetamol', quantity: 20 },
  ];

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
        <Text style={styles.headerTitle}>Prescription Results</Text>
      </View>

      {/* List of detected medicines */}
      <ScrollView style={styles.container}>
        <Text style={styles.title}>List of detected medicine:</Text>
        {medicines.map((medicine, index) => (
          <View key={index} style={styles.medicineCard}>
            <Text style={styles.medicineName}>{medicine.name}</Text>
            <Text style={styles.medicineQuantity}>Required Quantity: {medicine.quantity}</Text>
            <TouchableOpacity style={styles.availabilityButton} onPress={() => router.push('/screens/User/Features/PrescriptionAvailability')}>
              <Text style={styles.buttonText} >View pharmacy Availability</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
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
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    marginTop: 28,
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  container: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  medicineCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 3, // for shadow on Android
    shadowColor: '#000', // for shadow on iOS
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  medicineQuantity: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  availabilityButton: {
    backgroundColor: '#005b7f',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default PrescriptionResultsScreen;
