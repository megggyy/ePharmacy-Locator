import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';
import axios from 'axios';
import TopBar from '../drawer/TopBar';
import baseURL from '@/assets/common/baseurl'; 
import pharmacyImage from '@/assets/images/pharmacy.png';

export default function PharmacyScreen() {
  const router = useRouter();
  const [pharmacies, setPharmacies] = useState([]); // State to store pharmacy data
  const [isDropdownOpen1, setDropdownOpen1] = useState(false); // State for District 1 dropdown
  const [isDropdownOpen2, setDropdownOpen2] = useState(false); // State for District 2 dropdown

  useEffect(() => {
    // Fetch pharmacies and limit to 5
    axios.get(`${baseURL}pharmacies`)
      .then(response => {
        console.log('Pharmacies fetched:', response.data); // Check what is being returned
        // Check if response data is an array and limit it to 5 items
        setPharmacies(response.data.slice(0, 5)); // Ensure only 5 items are stored in state
      })
      .catch(error => {
        console.error('Error fetching pharmacies:', error);
      });
  }, []);
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Include TopBar component */}
      <TopBar />

      <ScrollView style={styles.container}>
        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {/* District 1 Dropdown */}
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              onPress={() => setDropdownOpen1(!isDropdownOpen1)}
              style={styles.filterButton}
            >
              <Text style={styles.filterText}>District 1</Text>
              <Ionicons
                name={isDropdownOpen1 ? "chevron-up" : "chevron-down"}
                size={16}
                color="#333"
              />
            </TouchableOpacity>
            {isDropdownOpen1 && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity>
                  <Text style={styles.dropdownItem}>Central Signal Village</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.dropdownItem}>North Signal Village</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.dropdownItem}>South Signal Village</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* District 2 Dropdown */}
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              onPress={() => setDropdownOpen2(!isDropdownOpen2)}
              style={styles.filterButton}
            >
              <Text style={styles.filterText}>District 2</Text>
              <Ionicons
                name={isDropdownOpen2 ? "chevron-up" : "chevron-down"}
                size={16}
                color="#333"
              />
            </TouchableOpacity>
            {isDropdownOpen2 && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity>
                  <Text style={styles.dropdownItem}>New Lower Bicutan</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.dropdownItem}>Lower Bicutan</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.dropdownItem}>Hagonoy</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Pharmacies Section */}
          <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pharmacies</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll} onPress={() => router.push('../screens/User/Features/ViewAllPharmacies')}>View all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pharmaciesContainer}>
          {pharmacies.map((pharmacy) => (
            <PharmacyCard
              key={pharmacy._id}
              name={pharmacy.userInfo.name}
              imageUrl={pharmacy.image || 'https://res.cloudinary.com/di9gjajky/image/upload/v1732033031/pplwsy2ie8odxp8zss9f.jpg'} 
              address={`${pharmacy.userInfo.street}, ${pharmacy.userInfo.barangay}, ${pharmacy.userInfo.city}`}
              barangay={pharmacy.userInfo.barangay}
              // storeHours={pharmacy.storeHours || 'Not available'}
              onPress={() => router.push('/screens/User/Features/PharmacyDetails')}
            />
          ))}
        </ScrollView>

        {/* Pharmacies Near Me Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pharmacies near me</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll} onPress={() => router.push('../screens/User/Features/PharmaciesNearMe')}>View all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pharmaciesContainer}>
          <PharmacyCard
            name="Pharmacy 3"
            imageUrl="https://via.placeholder.com/150" // Placeholder image
            address="789 Hagonoy St, Taguig"
            barangay="Hagonoy"
            storeHours="8 AM - 9 PM"
            onPress={() => router.push('/screens/User/Features/PharmacyDetails')}
          />
          <PharmacyCard
            name="Pharmacy 4"
            imageUrl="https://via.placeholder.com/150" // Placeholder image
            address="101 South Signal Rd, Taguig"
            barangay="South Signal Village"
            storeHours="7 AM - 11 PM"
            onPress={() => router.push('/screens/User/Features/PharmacyDetails')}
          />
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

function PharmacyCard({ name, imageUrl, address, barangay, storeHours, onPress }) {
  return (
    <TouchableOpacity style={styles.pharmacyCard} onPress={onPress}>
      <Image source={{ uri: imageUrl }} style={styles.pharmacyImage} />
      <View style={styles.pharmacyInfo}>
        <Text style={styles.pharmacyName}>{name}</Text>
        <View style={styles.addressContainer}>
          <Ionicons name="location-outline" size={14} color="#FF6347" />
          <Text style={styles.addressText}>{address}</Text>
        </View>
        <Text style={styles.barangayText}>{barangay}</Text>
        {/* <Text style={styles.storeHoursText}>Store Hours: {storeHours}</Text> */}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#005b7f' },
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  menuIcon: { fontSize: 28, color: '#fff' },
  topSection: { 
    paddingHorizontal: 16,
    paddingBottom: 10, 
    borderBottomLeftRadius: 25, 
    borderBottomRightRadius: 25, 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 10,
  },
  locationWrapper: { flex: 1, marginLeft: 10 },
  location: { fontSize: 16, color: '#fff' },
  iconsWrapper: { flexDirection: 'row' },
  icon: { fontSize: 20, marginHorizontal: 10, color: '#fff'  },
  searchBar: { marginVertical: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },

  /* Filter Section */
  filterContainer: { flexDirection: 'row', paddingHorizontal: 15, marginVertical: 10 },
  dropdownWrapper: { flex: 1, marginRight: 10 },
  filterButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 3,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterText: { color: '#333' },

  dropdownMenu: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 5,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 5,
    color: '#333',
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  viewAll: { fontSize: 14, color: '#005b7f' },

  /* Pharmacies Section */
  pharmaciesContainer: { paddingHorizontal: 15, marginBottom: 20 },
  pharmacyCard: {
    flexDirection: 'row', // To place image on the left and info on the right
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 15,
    elevation: 3,
    width: 300, // Adjusted width for more content
    padding: 10,
  },
  pharmacyImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15, // Space between image and info
  },
  pharmacyInfo: {
    flex: 1, // Take up remaining space for info
    justifyContent: 'center',
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  barangayText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  storeHoursText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});
