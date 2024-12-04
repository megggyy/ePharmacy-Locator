import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../drawer/TopBar';
import baseURL from '@/assets/common/baseurl';
import AuthGlobal from '@/context/AuthGlobal';

const HomeScreen = () => {
  const router = useRouter();
  const { state } = useContext(AuthGlobal);
  const [categories, setCategories] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [medications, setMedications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data on component mount
  useFocusEffect(
    React.useCallback(() => {
      // Fetch categories
      axios.get(`${baseURL}medication-category`)
        .then(response => setCategories(response.data))
        .catch(error => console.error('Error fetching categories:', error));

      // Fetch pharmacies 
      axios.get(`${baseURL}pharmacies`)
        .then(response => setPharmacies(response.data))
        .catch(error => console.error('Error fetching pharmacies:', error));
        
      // Fetch medications
      axios.get(`${baseURL}medicine`)
        .then(response => setMedications(response.data))
        .catch(error => console.error('Error fetching medications:', error));
    }, []) // Empty dependency array to run only once when the component mounts
  );

  // Handle search input change
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Filter categories, pharmacies, and medications based on search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPharmacies = pharmacies.filter((pharmacy) =>
    pharmacy.userInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pharmacy.userInfo.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pharmacy.userInfo.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMedications = medications.filter((medication) =>
    medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medication.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Include TopBar component */}
      <View style={styles.topSection}>
    {/* Header with Location and Icons */}
    {state.isAuthenticated && (
    <View style={styles.header}>
      <Ionicons name="menu" style={styles.menuIcon} onPress={() => router.push('/drawer/UserDrawer')}/>          
     
      <View style={styles.iconsWrapper}>
        <Ionicons name="cloud-upload" style={styles.icon} onPress={() => router.push('/screens/User/Features/PrescriptionUpload')} />
      </View>
    </View>
    )}
      {/* Search Bar */}
      <TextInput
          style={styles.searchBar}
          placeholder="Search categories, pharmacies, or medications"
          placeholderTextColor="#AAB4C1"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      <ScrollView style={styles.container}>
     

        {/* Categories Section */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={[styles.categories, { justifyContent: filteredCategories.length === 2 ? 'center' : 'space-between' }]}>
          {filteredCategories.map((category) => (
            <TouchableOpacity
              key={category._id}
              style={styles.categoryCard}
              onPress={() => router.push(`/screens/User/Features/CategoryFilterMedications?id=${category._id}&name=${category.name}`)}
            >
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pharmacies Section */}
        <Text style={styles.sectionTitle}>Pharmacies</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filteredPharmacies.map((pharmacy) => (
            <TouchableOpacity
              key={pharmacy._id}
              style={styles.pharmacyCard}
              onPress={() => router.push(`/screens/User/Features/PharmacyDetails?id=${pharmacy._id}`)}
            >
              <Image
                style={styles.pharmacyImage}
                source={require('@/assets/images/pharmacy.png')}
              />
              <View style={styles.pharmacyInfo}>
                <Text style={styles.pharmacyName}>{pharmacy.userInfo.name}</Text>
                <Text style={styles.pharmacyLocation}>{`${pharmacy.userInfo.street}, ${pharmacy.userInfo.barangay}, ${pharmacy.userInfo.city}`}</Text>
                <Text style={styles.pharmacyLocation}>{pharmacy.userInfo.contactNumber}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Medications Section */}
        <Text style={styles.sectionTitle}>Medications</Text>
        {filteredMedications.map((medication) => (
          <TouchableOpacity
            key={medication._id}
            style={styles.productCard}
            onPress={() => router.push(`/screens/User/Features/MedicationDetails?name=${medication.name}`)}
          >
            <Image
              style={styles.productImage}
              source={{ uri: medication.images && medication.images.length > 0 ? medication.images[0] : 'https://via.placeholder.com/100' }} // Fallback image
            />
            <View>
              <Text style={styles.productName}>{medication.name}</Text>
              <Text style={styles.productCategory}>{medication.category && medication.category.name}</Text>
              <Text style={styles.productPrice}>Stock: {medication.stock}</Text>
              <Text style={styles.pharmacyInfo}>Pharmacy: {medication.pharmacy.userInfo.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

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
  locationWrapper: { flex: 1, marginLeft: 10 },
  location: { fontSize: 16, color: '#fff' },

  menuIcon: {
  fontSize: 30,
  color: '#fff',
  },
  icon: { fontSize: 20, marginHorizontal: 10, color: '#fff'  },
  searchBar: { marginVertical: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },

    categories: { 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      justifyContent: 'space-between', 
      marginTop: 10
    },
  categoryCard: { 
    width: '22%', 
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 8 
  },
  categoryText: { 
    marginTop: 5, 
    fontSize: 12, 
    textAlign: 'center' 
  },

  pharmacyCard: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    width: 300,
    alignItems: 'center',
  },
  pharmacyImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  pharmacyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pharmacyLocation: {
    fontSize: 14,
    color: '#666',
    flexWrap: 'wrap',
    maxWidth: '80%',
    marginTop: 5,
  },

  productCard: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderRadius: 10, marginVertical: 10 },
  productImage: { width: 100, height: 100, borderRadius: 10, marginRight: 10 },
  productName: { fontSize: 16, fontWeight: 'bold' },
  productCategory: { fontSize: 14, color: '#888', marginTop: 5 },
  productPrice: { fontSize: 14, color: 'green' },
  pharmacyInfo: { fontSize: 14, color: '#666', marginTop: 5 },
});

export default HomeScreen;
