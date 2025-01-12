import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps'; 
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';  // Assuming baseURL is defined elsewhere

const PharmacyDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPharmacyDetails = async () => {
      try {
        const response = await axios.get(`${baseURL}pharmacies/${id}`);
        setPharmacy(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pharmacy details:', error);
        setLoading(false);
      }
    };

    fetchPharmacyDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B607E" />
      </View>
    );
  }

  if (!pharmacy) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load pharmacy details.</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{pharmacy.userInfo.name}</Text>
      </View>
      <ScrollView>
        {/* Pharmacy Image */}
        <View style={styles.imageContainer}>
        <Image
                style={styles.pharmacyImage}
                source={
                  pharmacy?.images?.[0]
                    ? { uri: pharmacy.images[0] }
                    : require('@/assets/images/sample.jpg')
                }
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
            <Text style={styles.infoText}>{pharmacy.userInfo.contactNumber}</Text>
            
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#555" />
            <Text style={styles.infoText}>
              {`${pharmacy.businessDays} (${pharmacy?.openingHour || 'N/A'} - ${pharmacy?.closingHour || 'N/A'})`}
            </Text>
          </View>


          {/* Map View */}
          <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: parseFloat(pharmacy.location.latitude),
              longitude: parseFloat(pharmacy.location.longitude),
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
          >
            <Marker
              coordinate={{
                latitude: parseFloat(pharmacy.location.latitude),
                longitude: parseFloat(pharmacy.location.longitude),
              }}
              title={pharmacy.userInfo.name}
            />
          </MapView>

          </View>
        </View>
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
    paddingTop: 40,
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
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  pharmacyImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
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
    color: 'green',
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

export default PharmacyDetails;
