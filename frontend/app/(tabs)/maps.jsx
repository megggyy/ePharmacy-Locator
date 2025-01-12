import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, ActivityIndicator, Image, FlatList, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, Callout } from 'react-native-maps';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import Toast from 'react-native-toast-message'; // Add this import
import Spinner from "@/assets/common/spinner";
import * as Location from 'expo-location';

// Haversine formula to calculate the distance between two lat/lng points
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => deg * (Math.PI / 180); // Converts degrees to radians
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Returns distance in kilometers
  return distance;
};

export default function MapsScreen() {
  const router = useRouter();

  const [region, setRegion] = useState({
    latitude: 14.5350, // Coordinates for Taguig City
    longitude: 121.0509,
    latitudeDelta: 0.09,
    longitudeDelta: 0.09,
  });

  const [userLocation, setUserLocation] = useState(null); // State for the user's location
  const [pharmacies, setPharmacies] = useState([]); // State to store pharmacies data
  const [filteredPharmacies, setFilteredPharmacies] = useState([]); // State for filtered pharmacies
  const [isLoading, setIsLoading] = useState(true); // State for loading status
  const [searchQuery, setSearchQuery] = useState('');
  const [pharmacySuggestions, setPharmacySuggestions] = useState([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(null);
  const [showAllPharmacies, setShowAllPharmacies] = useState(false); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null); // For the popup
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  const handleMarkerPress = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setIsModalVisible(true);
  };
  
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedPharmacy(null);
  };  
  useEffect(() => {
    let locationSubscription;
    let backendPollingInterval;
  
    const updateUserLocationInDatabase = async (latitude, longitude) => {
      try {
        console.log('Updating user location in database...', latitude, longitude);
        const token = await AsyncStorage.getItem('jwt');
        if (!token) return;
  
        const decoded = jwtDecode(token);
        const userId = decoded?.userId;
        if (!userId) throw new Error('User ID not found in token');
  
        const response = await axios.patch(
          `${baseURL}customers/${userId}/update-location`,
          { latitude, longitude },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Backend response:', response.data);
      } catch (error) {
        console.error('Error updating user location in database:', error);
      }
    };
  
    const trackUserLocation = async () => {
      if (!locationPermissionGranted) {
        console.log('Location permission not granted');
        return;
      }
  
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        async (location) => {
          const { latitude, longitude } = location.coords;
          console.log('Tracking user location:', latitude, longitude);
  
          setUserLocation({ latitude, longitude });
  
          await updateUserLocationInDatabase(latitude, longitude);
        }
      );
    };
  
    const fetchLocationFromBackend = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        if (!token) return;
  
        const decoded = jwtDecode(token);
        const userId = decoded?.userId;
        if (!userId) throw new Error('User ID not found in token');
  
        const response = await axios.get(`${baseURL}users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.data) {
          console.log('Response data:', response.data);
  
          const { latitude, longitude } = response.data.customerDetails.location || {};
          console.log('Parsed coordinates from backend:', latitude, longitude);
  
          if (!latitude || !longitude || isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
            console.error('Invalid coordinates received:', latitude, longitude);
            return;
          }
  
          setUserLocation((prevLocation) => {
            console.log('Previous location:', prevLocation);
            console.log('New coordinates:', latitude, longitude);
  
            if (
              prevLocation?.latitude !== parseFloat(latitude) ||
              prevLocation?.longitude !== parseFloat(longitude)
            ) {
              setRegion((prevRegion) => ({
                ...prevRegion,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                latitudeDelta: 0.009,
                longitudeDelta: 0.009,
              }));
  
              console.log('Backend location updated:', latitude, longitude);
            }
  
            return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
          });
          trackUserLocation();
        }
      } catch (error) {
        console.error('Error fetching location from backend:', error);
      }
    };
  
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionGranted(status === 'granted');
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Location permission not granted',
          text2: 'Unable to track your location.',
        });
        return;
      }
    };
  
    requestLocationPermission();
  
  
    // Poll for location updates after local tracking and backend updates
    backendPollingInterval = setInterval(fetchLocationFromBackend, 10000);
  
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      clearInterval(backendPollingInterval);
    };
  }, [locationPermissionGranted]);
  
    useEffect(() => {
      if (userLocation && pharmacies.length > 0) {
        const filtered = pharmacies.filter((pharmacy) => {
          const distance = haversineDistance(
            userLocation.latitude,
            userLocation.longitude,
            pharmacy.location.latitude,
            pharmacy.location.longitude
          );
          return distance <= 1; // Filter pharmacies within 1 km
        });
        setFilteredPharmacies(filtered);
      }
    }, [userLocation, pharmacies]);
  

      useEffect(() => {
        const fetchUserLocation = async () => {
          try {
            const token = await AsyncStorage.getItem('jwt');
            if (!token) {
              setRegion({
                latitude: 14.5350, // Default Taguig
                longitude: 121.0509,
                latitudeDelta: 0.09,
                longitudeDelta: 0.09,
              });
              Toast.show({
                type: 'info',
                position: 'top',
                text1: 'Log in to see your location',
                visibilityTime: 3000,
              });
              return;
            }
            const decoded = jwtDecode(token);
            const userId = decoded?.userId;
            if (!userId) throw new Error('User ID not found in token');
            
            const response = await fetch(`${baseURL}users/${userId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });
            if (!response.ok) throw new Error('Failed to fetch user data');
            const data = await response.json();
            
            const userLat = parseFloat(data.customerDetails?.location.latitude);
            const userLong = parseFloat(data.customerDetails?.location.longitude);
            setUserLocation({ latitude: userLat, longitude: userLong });
            setRegion((prevRegion) => ({
              ...prevRegion,
              latitude: userLat,
              longitude: userLong,
              latitudeDelta: 0.009,
              longitudeDelta: 0.009,
            }));
            setIsLoggedIn(true);
          } catch (error) {
            console.error('Error fetching user location:', error);
          }
        };
    
        const fetchPharmacies = async (userLat = null, userLong = null) => {
          try {
            const pharmaciesResponse = await axios.get(`${baseURL}pharmacies`);
            const approvedPharmacies = pharmaciesResponse.data.filter(pharmacy => pharmacy.approved === true); // Only include approved pharmacies
            setPharmacies(approvedPharmacies); // Update pharmacies state with only approved pharmacies
            setIsLoading(false);
        
            // If user is logged in and has a location, filter pharmacies based on distance
            if (userLat && userLong) {
              const filtered = approvedPharmacies.filter((pharmacy) => {
                const distance = haversineDistance(
                  userLat,
                  userLong,
                  pharmacy.location.latitude,
                  pharmacy.location.longitude
                );
                return distance <= 1; // Filter pharmacies within 1 km
              });
              setFilteredPharmacies(filtered);
            } else {
              // If no user location, show all approved pharmacies
              setFilteredPharmacies(approvedPharmacies);
            }
          } catch (error) {
            console.error('Error fetching pharmacies:', error);
            setIsLoading(false);
          }
        };
        
        // Fetch user location and pharmacies data on button click
        const fetchData = async () => {
          await fetchUserLocation();
          await fetchPharmacies();
        };
    
        fetchData(); // Trigger fetch on first render
      }, []);

    const handleSearch = (query) => {
      setSearchQuery(query);
    
      if (query.trim() === '') {
        // Reset to show either all pharmacies or nearby pharmacies based on the toggle
        if (showAllPharmacies) {
          setFilteredPharmacies(pharmacies);
        } else if (userLocation) {
          const nearbyPharmacies = pharmacies.filter((pharmacy) => {
            const distance = haversineDistance(
              userLocation.latitude,
              userLocation.longitude,
              pharmacy.location.latitude,
              pharmacy.location.longitude
            );
            return distance <= 1; // Within 1 km
          });
          setFilteredPharmacies(nearbyPharmacies);
        }
        setPharmacySuggestions([]);
        return;
      }
    
      // Filter pharmacies by name
      const suggestions = pharmacies.filter((pharmacy) =>
        pharmacy.userInfo.name.toLowerCase().includes(query.toLowerCase())
      );
    
      // If not showing all pharmacies, limit suggestions to nearby ones
      const filteredSuggestions = showAllPharmacies
        ? suggestions
        : suggestions.filter((pharmacy) => {
            if (!userLocation) return false; // No user location available
            const distance = haversineDistance(
              userLocation.latitude,
              userLocation.longitude,
              parseFloat(pharmacy.location.latitude),
              parseFloat(pharmacy.location.longitude)
            );
            return distance <= 1; // Nearby pharmacies only
          });
    
      setPharmacySuggestions(filteredSuggestions.slice(0, 5)); // Limit to 5 suggestions
      setFilteredPharmacies(filteredSuggestions); // Update map markers
    };
    
    
    const handleSuggestionSelect = (pharmacy) => {
      setSearchQuery(pharmacy.userInfo.name);
      setFilteredPharmacies([pharmacy]);
      setSelectedPharmacyId(pharmacy.id); // Highlight this marker
      setTimeout(() => {
        setRegion({
          latitude: parseFloat(pharmacy.location.latitude),
          longitude: parseFloat(pharmacy.location.longitude),
          latitudeDelta: 0.004,
          longitudeDelta: 0.004,
        });
      }, 100); // 100ms delay
      
      setPharmacySuggestions([]); // Clear suggestions
    };

    const toggleAllPharmacies = () => {
      setShowAllPharmacies(!showAllPharmacies);
      if (!showAllPharmacies) {
        // Show all pharmacies
        setFilteredPharmacies(pharmacies);
      } else {
        // Show only nearby pharmacies
        if (userLocation) {
          const filtered = pharmacies.filter((pharmacy) => {
            const distance = haversineDistance(
              userLocation.latitude,
              userLocation.longitude,
              pharmacy.location.latitude,
              pharmacy.location.longitude
            );
            return distance <= 1; // Filter pharmacies within 1 km
          });
          setFilteredPharmacies(filtered);
        }
      }
    };
  
    const onRegionChange = (region) => {
      setRegion(region);
    };

    if (isLoading) {
      return <Spinner />; // Show the spinner while data is loading
    }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topSection}>
        {/* Header with Back Arrow */}
      <View style={styles.header}>
      <Text style={styles.headerTitle}>Pharmacies</Text>
    </View>

     {/* Search Box */}
      {isLoggedIn && (
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a pharmacy"
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>
    )}


        {/* Suggestions Dropdown */}
        {pharmacySuggestions.length > 0 && (
          <FlatList
            data={pharmacySuggestions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableWithoutFeedback
                onPress={() => handleSuggestionSelect(item)}
              >
                <View style={styles.suggestionItem}>
                  <Text style={styles.suggestionText}>{item.userInfo.name}</Text>
                </View>
              </TouchableWithoutFeedback>
            )}
            style={styles.suggestionsDropdown}
          />
        )}
      </View>
      {/* Map View */}
      <MapView
        style={styles.map}
        region={region} // The region is updated when pharmacies are fetched
        onRegionChangeComplete={onRegionChange} // User moves the map
        showsUserLocation
        showsMyLocationButton
      >
        {/* User Marker (only show if userLocation is available) */}
        {userLocation && (
        <Marker
          coordinate={userLocation}
          pinColor="blue" // Custom color for the user's marker
          description="This is your location" // Directly set the description
        />
        )}

        {/* Marker for each filtered pharmacy */}
        {filteredPharmacies.map((pharmacy) => (
          <Marker
            key={pharmacy.id}
            coordinate={{
              latitude: parseFloat(pharmacy.location.latitude),
              longitude: parseFloat(pharmacy.location.longitude),
            }}
            pinColor="red"
            onPress={() => handleMarkerPress(pharmacy)}
          />
        ))}
      </MapView>

      {/* Popup Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedPharmacy && (
              <>
                <Image
                  source={{ uri: selectedPharmacy.images[0] }}
                  style={styles.pharmacyImage}
                />
                <Text style={styles.pharmacyName}>{selectedPharmacy.userInfo.name}</Text>
                <Text style={styles.pharmacyDetails}>
                  Location: {`${selectedPharmacy.userInfo.street}, ${selectedPharmacy.userInfo.barangay}, ${selectedPharmacy.userInfo.city}`}
                </Text>
                <Text style={styles.pharmacyDetails}>
                  Contact: {selectedPharmacy.userInfo.contactNumber}
                </Text>
                <Text style={styles.pharmacyDetails}>
                  Business Days: {selectedPharmacy.businessDays}
                </Text>
                <Text style={styles.pharmacyDetails}>
                  Store Hours: {`${selectedPharmacy.openingHour || 'N/A'} - ${selectedPharmacy.closingHour || 'N/A'}`}
                </Text>
              </>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      
      {/* Toggle Button */}
        {isLoggedIn && ( // Conditionally render toggle button based on login status
            <TouchableOpacity 
            style={styles.toggleButton}
            onPress={toggleAllPharmacies}
            >
              <Text style={styles.toggleText}>
                {showAllPharmacies ? 'Show Nearby' : 'Show All'}
              </Text>
            </TouchableOpacity>
          )}
      {/* Toast component */}
      <Toast />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#005b7f',
  },
  topSection: {
    paddingHorizontal: 16,
    paddingBottom: 5,
    paddingTop: 20,

    backgroundColor: "#005b7f",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
    paddingHorizontal: 10,
  },
  backButton: {
    marginRight: 10,
  },
  iconBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom:5,
  },
  searchBox: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    color: 'black',
  },
   suggestionsDropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 5,
    marginTop: 5,
  },
  suggestionItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#005b7f',
  },
  suggestionText: {
    fontSize: 16,
  },
  map: {
    flex: 1,
  },
  calloutContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: 250,
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
  toggleButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  toggleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  pharmacyImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  pharmacyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pharmacyDetails: {
    fontSize: 14,
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f05a5b',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
