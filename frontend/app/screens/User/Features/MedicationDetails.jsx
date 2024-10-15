import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps'; 
import { useRouter } from 'expo-router';

const MedicationDetails = () => {
  const router = useRouter();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const pharmacy = {
    name: "Pullentes Pharmacy",
    address: 'G365+VM5, Castañas St, Taguig, Metro Manila',
    phone: '+63 917 123 4567',
    stock: '100 Stocks',
    coordinates: {
      latitude: 14.5534, 
      longitude: 121.0507, 
    },
  };

  const medication = {
    name: "Paracetamol 500g",
    description: "Paracetamol is a common pain reliever and fever reducer. It is used to treat mild to moderate pain, such as headaches, menstrual periods, toothaches, backaches, osteoarthritis, or cold/flu pains, and to reduce fever.",
    images: [
      require('@/assets/images/sample.jpg'), // Replace with actual images
      require('@/assets/images/icon.png'), 
      require('@/assets/images/react-logo.png'), 
    ],
  };

  const renderImageItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => setActiveImageIndex(index)}>
      <Image source={item} style={styles.thumbnailImage} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.safeArea}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{pharmacy.name}</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContent}>
        {/* Medication Name */}
        <Text style={styles.medicationName}>{medication.name}</Text>

        {/* Gallery Section */}
        <View style={styles.galleryContainer}>
          {/* Active Large Image */}
          <Image 
            source={medication.images[activeImageIndex]} 
            style={styles.activeImage} 
          />

          {/* Image Thumbnails for Gallery */}
          <FlatList 
            data={medication.images}
            renderItem={renderImageItem}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.thumbnailContainer}
          />
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
            <Text
              style={styles.infoText}
              onPress={() => Linking.openURL(`tel:${pharmacy.phone}`)}>
              {pharmacy.phone}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cube-outline" size={18} color="#555" />
            <Text style={styles.stockText}>{pharmacy.stock}</Text>
          </View>

          {/* Medication Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{medication.description}</Text>
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

        {/* Extra padding at the bottom */}
        <View style={styles.bottomSpace}></View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#F4F4F4' 
  },
  header: {
    backgroundColor: '#0B607E',
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
  container: {
    padding: 16,
  },
  scrollViewContent: {
    paddingBottom: 100, // Added padding to ensure the map and content are not cut off
  },
  medicationName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  galleryContainer: {
    marginBottom: 20,
  },
  activeImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  thumbnailImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginHorizontal: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  infoContainer: {
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
    color: 'green',
  },
  descriptionContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 2,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 16,
    color: '#555',
  },
  mapContainer: {
    marginTop: 20,
    height: 200,
    borderRadius: 10,
    overflow: 'hidden', 
  },
  map: {
    flex: 1,
  },
  bottomSpace: {
    height: 50, // Extra space to avoid cutting off content at the bottom
  },
});

export default MedicationDetails;
