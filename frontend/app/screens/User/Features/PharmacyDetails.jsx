import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps'; 
import { useRouter } from 'expo-router';

const PharmacyDetails = () => {
  const router = useRouter();
  const pharmacy = {
    name: "J's Pharmacy & Mini Mart",
    address: '308 M. L. Quezon Ave, Manila, Metro Manila',
    phone: '+63 917 123 4567',
    stock: '100 Stocks',
    image: require('@/assets/images/sample.jpg'), // Replace with actual pharmacy image
    coordinates: {
      latitude: 14.5534, // Example latitude for the map
      longitude: 121.0507, // Example longitude for the map
    },
  };

  return (
    <View style={styles.container}>
          <View style={styles.header}>
        <TouchableOpacity  onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Header */}
        <Text style={styles.headerText}>{pharmacy.name}</Text>
      </View>
      <ScrollView>
        {/* Pharmacy Image */}
        <View style={styles.imageContainer}>
          <Image source={pharmacy.image} style={styles.pharmacyImage} />
        </View>

        {/* Pharmacy Information */}
        <View style={styles.infoContainer}>
          <Text style={styles.pharmacyName}>{pharmacy.name}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#555" />
            <Text style={styles.infoText}>{pharmacy.address}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#555" />
            <Text style={styles.infoText}>{pharmacy.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cube-outline" size={18} color="#555" />
            <Text style={styles.stockText}>{pharmacy.stock}</Text>
          </View>

          {/* Map View */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: pharmacy.coordinates.latitude,
                longitude: pharmacy.coordinates.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={pharmacy.coordinates}
                title={pharmacy.name}
                description={pharmacy.address}
              />
            </MapView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F4F4',
      },
    header: {
        backgroundColor: '#0B607E', // Blue header background, full width
        paddingTop: 80,
        paddingBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
      },
      backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
      },
      headerText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
      },
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1, backgroundColor: '#fff' },

  /* Image */
  imageContainer: { alignItems: 'center', marginTop: 20 },
  pharmacyImage: {
    width: 200,
    height: 200,
    borderRadius: 100, // Circular image
  },

  /* Information */
  infoContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  pharmacyName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#555',
  },
  stockText: {
    marginLeft: 8,
    fontSize: 16,
    color: 'green', // Green color for stock
  },

  /* Map */
  mapContainer: {
    marginTop: 20,
    height: 200,
    borderRadius: 10,
    overflow: 'hidden', // Ensures the map is rounded
  },
  map: {
    flex: 1,
  },
});

export default PharmacyDetails;
