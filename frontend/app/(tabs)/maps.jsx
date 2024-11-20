import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, Callout } from 'react-native-maps';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';

export default function MapsScreen() {
  const router = useRouter();

  const [region, setRegion] = useState({
    latitude: 14.5350, // Coordinates for Taguig City
    longitude: 121.0509,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  });
  
  const [pharmacies, setPharmacies] = useState([]); // State to store pharmacies data
  const [isLoading, setIsLoading] = useState(true); // State for loading status

  // Fetch pharmacies data
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const pharmaciesResponse = await axios.get(`${baseURL}pharmacies`);
        setPharmacies(pharmaciesResponse.data); // Directly access the data from the response
        setIsLoading(false); // Stop loading once data is fetched
      } catch (error) {
        console.error('Error fetching pharmacies:', error);
        setIsLoading(false); // Stop loading even in case of error
      }
    };

    fetchPharmacies();
  }, []);

  const onRegionChange = (region) => {
    setRegion(region);
  };

  if (isLoading) {
    // Show loading indicator while fetching pharmacies data
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#005b7f" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topSection}>
        {/* Header with Back Arrow */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            {/* Circle behind the back arrow */}
            <View style={styles.iconBackground}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Maps</Text>
        </View>

        {/* Search Box */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search this area"
            placeholderTextColor="gray"
          />
        </View>
      </View>

      {/* Map View */}
      <MapView
        style={styles.map}
        region={region} // The region is updated when pharmacies are fetched
        onRegionChangeComplete={onRegionChange} // User moves the map
      >
        {/* Marker for each pharmacy */}
        {pharmacies.map((pharmacy) => (
          <Marker
            key={pharmacy.id} // Unique key for each marker
            coordinate={{
              latitude: pharmacy.location.latitude,
              longitude: pharmacy.location.longitude,
            }}
            title={pharmacy.userInfo.name} // Display the pharmacy name as the title
            description="Pharmacy Location" // Description (can be changed)
          >
            <Callout>
              <View style={styles.calloutContainer}>
                <Image
                source={require('@/assets/images/sample.jpg')}
                  // source={{ uri: 'https://via.placeholder.com/100' }} // Sample placeholder image
                  style={styles.calloutImage}
                />
                <Text style={styles.calloutTitle}>{pharmacy.userInfo.name}</Text>
                <Text style={styles.calloutText}>Location: {`${pharmacy.userInfo.street}, ${pharmacy.userInfo.barangay}, ${pharmacy.userInfo.city}`}</Text>
                <Text style={styles.calloutText}>Contact: {pharmacy.userInfo.contactNumber}</Text>
                {/* <Text style={styles.calloutText}>Open Hours: {pharmacy.userInfo.openHours}</Text> */}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#005b7f', // Similar to the original
  },
  topSection: {
    paddingHorizontal: 16,
    paddingBottom: 5,
    backgroundColor: "#005b7f",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
    paddingHorizontal: 10, // Adjust spacing
  },
  backButton: {
    marginRight: 10,
  },
  iconBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black for contrast
    borderRadius: 25, // Makes it a circle
    padding: 10, // Adjust the size of the circle
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  searchBox: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    color: 'black',
  },
  map: {
    flex: 1,
  },
  calloutContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: 250, // Adjust max width of the callout
    padding: 10,
  },
  calloutImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  calloutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005b7f',
    textAlign: 'center',
  },
  calloutText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginVertical: 2,
  },
});
