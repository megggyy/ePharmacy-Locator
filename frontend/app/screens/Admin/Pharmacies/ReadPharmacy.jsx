import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ReadPharmacyScreen() {
  const router = useRouter();

  // Sample pharmacy data
  const pharmacyData = {
    name: 'Sample Pharmacy',
    storeHours: '8:00am - 5:00pm',
    location: 'New Lower Bicutan, Taguig City',
    contact: '(02) 1234-5678',
    image: require('@/assets/images/sample.jpg'), // Replace with actual image path or a placeholder image
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Pharmacy Details</Text>
      </View>

      {/* Pharmacy Details */}
      <View style={styles.detailsContainer}>
        <Image source={pharmacyData.image} style={styles.image} />
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{pharmacyData.name}</Text>
        <Text style={styles.label}>Store Hours:</Text>
        <Text style={styles.value}>{pharmacyData.storeHours}</Text>
        <Text style={styles.label}>Location:</Text>
        <Text style={styles.value}>{pharmacyData.location}</Text>
        <Text style={styles.label}>Contact:</Text>
        <Text style={styles.value}>{pharmacyData.contact}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#0B607E',
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    marginBottom: 20,
  },
});
