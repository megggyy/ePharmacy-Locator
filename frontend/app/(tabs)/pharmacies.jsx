import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AuthGlobal from '@/context/AuthGlobal';
import baseURL from '@/assets/common/baseurl';

export default function PharmacyScreen() {
  const { state } = useContext(AuthGlobal);
  const router = useRouter();
  const [pharmacies, setPharmacies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchBarPosition, setSearchBarPosition] = useState({ width: 0, left: 0 });
  const [barangays, setBarangays] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`${baseURL}pharmacies`)
      .then((response) => {
        const pharmaciesData = response.data;
  
        // Filter pharmacies to include only approved ones
        const approvedPharmacies = pharmaciesData.filter(pharmacy => pharmacy.approved);
  
        // Update the state with approved pharmacies
        setPharmacies(approvedPharmacies);
        setFilteredPharmacies(approvedPharmacies);
  
        // Extract unique barangays from the filtered pharmacies
        const uniqueBarangays = [
          ...new Set(approvedPharmacies.map((pharmacy) => pharmacy.userInfo.barangay)),
        ];
        setBarangays(uniqueBarangays);
      })
      .catch((error) => {
        console.error('Error fetching pharmacies:', error);
      });
  }, []);
  

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === '') {
      setFilteredPharmacies(pharmacies);
      setSuggestions([]);
    } else {
      const filtered = pharmacies.filter(
        (pharmacy) =>
          pharmacy.userInfo.name.toLowerCase().includes(query.toLowerCase()) ||
          pharmacy.userInfo.barangay.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPharmacies(filtered);
      setSuggestions(filtered.slice(0, 5));
    }
  };

  const handleBarangaySelect = (barangay) => {
    setSelectedBarangay(barangay);
    setDropdownOpen(false);

    // Filter pharmacies by selected barangay
    const filtered = pharmacies.filter(
      (pharmacy) => pharmacy.userInfo.barangay === barangay
    );
    setFilteredPharmacies(filtered);
  };

  const handleSuggestionSelect = (pharmacy) => {
    setSearchQuery(pharmacy.userInfo.name);
    setFilteredPharmacies([pharmacy]);
    setSuggestions([]);
  };
 
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topSection}>
        {/* Header with Location and Icons */}
        {state.isAuthenticated && (
          <View style={styles.header}>
            <Ionicons name="menu" style={styles.menuIcon} onPress={() => router.push('/drawer/UserDrawer')} />
            <View style={styles.iconsWrapper}>
              <Ionicons name="cloud-upload" style={styles.icon} onPress={() => router.push('/screens/User/Features/PrescriptionUpload')} />
            </View>
          </View>
        )}
        {/* Search Bar */}
        <TextInput
          style={styles.searchBar}
          placeholder="Search pharmacies"
          placeholderTextColor="#AAB4C1"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView style={styles.container}>
        {/* Pharmacies Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="business-outline" style={styles.iconStyle} />
          <Text style={styles.sectionTitle}>Pharmacies</Text>
          <TouchableOpacity onPress={() => router.push('/screens/User/Features/ViewAllPharmacies')}>
            <Text style={styles.viewAllButton}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dropdownWrapper}>
  <TouchableOpacity
    onPress={() => setDropdownOpen(!isDropdownOpen)}
    style={styles.filterButton}
  >
    <Text style={[styles.filterText, !selectedBarangay && { color: '#AAB4C1' }]}>
      {selectedBarangay || 'Select Barangay'}
    </Text>
    <Ionicons
      name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
      size={16}
      color="#333"
    />
  </TouchableOpacity>
  {isDropdownOpen && (
    <View style={styles.dropdownMenu}>
      {barangays.map((barangay, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleBarangaySelect(barangay)}
        >
          <Text style={styles.dropdownItem}>{barangay}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )}
</View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pharmaciesContainer}>
          {filteredPharmacies.map((pharmacy) => (
            <TouchableOpacity
              key={pharmacy._id}
              style={styles.pharmacyCard}
              onPress={() => router.push(`/screens/User/Features/PharmacyDetails?id=${pharmacy._id}`)}
            >
              {/* Pharmacy Image */}
              <Image
                style={styles.pharmacyImage}
                source={
                  pharmacy?.images?.[0]
                    ? { uri: pharmacy.images[0] }
                    : require('@/assets/images/sample.jpg')
                }
              />
              {/* Pharmacy Info */}
              <View style={styles.pharmacyInfo}>
                <Text style={styles.pharmacyName}>{pharmacy.userInfo.name}</Text>
                <Text style={styles.pharmacyLocation}>
                  {`${pharmacy.userInfo.street}, ${pharmacy.userInfo.barangay}, ${pharmacy.userInfo.city}`}
                </Text>
                <Text style={styles.pharmacyContact}>{pharmacy.userInfo.contactNumber}</Text>
                <Text style={styles.pharmacyHours}>
                  {`${pharmacy.businessDays} (${pharmacy?.openingHour || 'N/A'} - ${pharmacy?.closingHour || 'N/A'})`}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#005b7f' },
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#fff' },
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
  iconsWrapper: { flexDirection: 'row' },
  menuIcon: {
    fontSize: 30,
    color: '#fff',
  },
  icon: { fontSize: 20, marginHorizontal: 10, color: '#fff' },
  searchBar: { marginVertical: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  iconStyle: {
    fontSize: 24,
    color: '#005b7f',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllButton: {
    fontSize: 16,
    color: '#005b7f',
    fontWeight: 'bold',
  },
  pharmaciesContainer: {
    marginBottom: 15,
    paddingVertical: 10,
  },
  pharmacyCard: {
    width: 250,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginHorizontal: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pharmacyImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
  },
  pharmacyInfo: {
    alignItems: 'flex-start',
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  pharmacyLocation: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  pharmacyContact: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 5,
  },
  pharmacyHours: {
    fontSize: 12,
    color: '#999',
  },
  // dropdown
  dropdownWrapper: { flex: 1, marginRight: 10 },
  filterButton: {
  flexDirection: 'row',
  backgroundColor: '#dadce0',
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

});