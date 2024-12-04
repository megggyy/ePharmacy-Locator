import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, ActivityIndicator, Image, FlatList, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, Callout } from 'react-native-maps';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import Toast from 'react-native-toast-message'; // Add this import
import Spinner from "@/assets/common/spinner";


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

  // Fetch pharmacies data
  
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
              pharmacy.location.latitude,
              pharmacy.location.longitude
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
          latitude: pharmacy.location.latitude,
          longitude: pharmacy.location.longitude,
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
      >
        {/* User Marker (only show if userLocation is available) */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            pinColor="blue" // Custom color for the user's marker
          >
            <Callout>
              <Text>This is your location</Text>
            </Callout>
          </Marker>
        )}

        {/* Marker for each filtered pharmacy */}
        {filteredPharmacies.map((pharmacy) => (
          <Marker
          key={pharmacy.id} // Unique key for each marker
          coordinate={{
            latitude: pharmacy.location.latitude,
            longitude: pharmacy.location.longitude,
          }}
          title={pharmacy.userInfo.name} // Display the pharmacy name as the title
          pinColor="red" // Change color
        >
         <Callout>
           <View style={styles.calloutContainer}>
             {/* Display the first image of the pharmacy */}
             <Image
               source={{ uri: pharmacy.images[0] }} // Fetch the first image URL
               style={styles.calloutImage}
             />
             <Text style={styles.calloutTitle}>{pharmacy.userInfo.name}</Text>
             <Text style={styles.calloutText}>Location: {`${pharmacy.userInfo.street}, ${pharmacy.userInfo.barangay}, ${pharmacy.userInfo.city}`}</Text>
             <Text style={styles.calloutText}>Contact: {pharmacy.userInfo.contactNumber}</Text>
             <Text style={styles.calloutText}>Business Days: {pharmacy.businessDays}</Text>
             <Text style={styles.calloutText}>Store Hours: {`${pharmacy.openingHour || 'N/A'} - ${pharmacy.closingHour || 'N/A'}`}</Text>
           </View>
         </Callout>
       </Marker>
        ))}
      </MapView>
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
});
