import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';

const MedicationDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [medication, setMedication] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    if (id) {
      axios
        .get(`${baseURL}medicine/${id}`)
        .then((response) => {
          setMedication(response.data);
          setLoading(false); // Set loading to false once the data is fetched
        })
        .catch((error) => {
          console.error('Error fetching medication details:', error);
          setLoading(false); // Set loading to false in case of an error
        });
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B607E" />
      </View>
    );
  }

  if (!medication) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load medication details.</Text>
      </View>
    );
  }

  const pharmacy = medication.pharmacy;

  const renderImageItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => setActiveImageIndex(index)}>
      <Image source={{ uri: item }} style={styles.thumbnailImage} />
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
            source={{ uri: medication.images[activeImageIndex] || 'https://via.placeholder.com/300' }}
            style={styles.activeImage}
          />

          {/* Image Thumbnails */}
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
          <Text style={styles.pharmacyName}>{pharmacy.userInfo.name}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#555" />
            <Text style={styles.infoText}>
              {`${pharmacy.userInfo.street || ''}, ${pharmacy.userInfo.barangay || ''}, ${pharmacy.userInfo.city || ''}`.replace(/(, )+/g, ', ').trim()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#555" />
            <Text style={styles.infoText} onPress={() => Linking.openURL(`tel:${pharmacy.phone}`)}>
              {pharmacy.userInfo.contactNumber}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cube-outline" size={18} color="#555" />
            <Text style={styles.stockText}>{medication.stock} in stock</Text>
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
                latitude: pharmacy.location.latitude || 0,
                longitude: pharmacy.location.longitude || 0,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={pharmacy.location}
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
    backgroundColor: '#F4F4F4',
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
    paddingBottom: 100,
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
    height: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default MedicationDetails;
