import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';

export default function MapsScreen() {
  const router = useRouter();
  
  const [region, setRegion] = useState({
    latitude: 14.5534, // You can change these coordinates
    longitude: 121.0507,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const onRegionChange = (region) => {
    setRegion(region);
  };

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
        region={region}
        onRegionChangeComplete={onRegionChange}
      >
        <Marker
          coordinate={{ latitude: 14.5534, longitude: 121.0507 }} // Marker coordinates
          title="You are here"
          description="This is your current location"
        />
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
});
