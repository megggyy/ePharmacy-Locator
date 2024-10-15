import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import MapView, { Marker } from 'react-native-maps'; 
import { useRouter } from 'expo-router';

export default function PharmacyAvailability() {
  const router = useRouter();

  // Sample data for the medications
  const medications = [
    {
      id: 1,
      name: 'Paracetamol',
      pharmacy: 'Pullentes Pharmacy',
      location: 'Central Signal Village',
      stock: 100,
      price: 559.00,
      imageUrl: 'https://via.placeholder.com/150',
      coordinates: {
        latitude: 14.5534,
        longitude: 121.0507,
      },
    },
    {
      id: 2,
      name: 'Ibuprofen',
      pharmacy: 'Central Pharmacy',
      location: 'Upper Bicutan',
      stock: 50,
      price: 300.00,
      imageUrl: 'https://via.placeholder.com/150',
      coordinates: {
        latitude: 14.5555,
        longitude: 121.0456,
      },
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#fff" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Pharmacy Availability</Text>
      </View>

      {/* Medication List */}
      {medications.map((med) => (
        <TouchableOpacity 
          key={med.id} 
          style={styles.medicationCard}
          onPress={() => router.push('/screens/User/Features/MedicationDetails')}  // Navigate to MedicationDetails
        >
          {/* Medication Image and Details */}
          <View style={styles.row}>
            <Image source={{ uri: med.imageUrl }} style={styles.medImage} />
            <View style={styles.medDetails}>
              <Text style={styles.medName}>{med.name}</Text>
              <TouchableOpacity onPress={() => router.push('/pharmacy/' + med.pharmacy)}>
                <Text style={styles.pharmacyName}>{med.pharmacy}</Text>
              </TouchableOpacity>
              <Text style={styles.location}>Barangay: {med.location}</Text>
              <Text style={styles.stock}>Available Stocks: {med.stock}</Text>
            </View>
          </View>

          {/* Map View */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: med.coordinates.latitude,
                longitude: med.coordinates.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={med.coordinates}
                title={med.pharmacy}
                description={med.location}
              />
            </MapView>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#005b7f',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  medicationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  medImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  medDetails: {
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  medName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pharmacyName: {
    fontSize: 14,
    color: '#005b7f',
    textDecorationLine: 'underline',
  },
  location: {
    fontSize: 12,
    color: '#888',
  },
  stock: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  mapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  map: {
    flex: 1,
  },
});
