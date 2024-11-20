import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import TopBar from '../drawer/TopBar';
import baseURL from '@/assets/common/baseurl';

const HomeScreen = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [medications, setMedications] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
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
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Include TopBar component */}
      <TopBar />

      <ScrollView style={styles.container}>
        {/* Categories Section */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categories}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category._id}
              style={styles.categoryCard}
              onPress={() => router.push('../screens/User/Features/CategoryFilterMedications')}
            >
             <Image
              style={styles.categoryImage}
              source={{ uri: category.images && category.images.length > 0 ? category.images[0] : 'https://via.placeholder.com/100' }} // Fallback image if no images available
            />
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pharmacies Section */}
        <Text style={styles.sectionTitle}>Pharmacies</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {pharmacies.map((pharmacy) => (
            <TouchableOpacity
              key={pharmacy._id}
              style={styles.pharmacyCard}
              onPress={() => router.push('/screens/User/Features/PharmacyDetails')}
            >

              {/* wala pa tayong image so eto muna */}
              <Image
                style={styles.pharmacyImage}
                source={require('@/assets/images/pharmacy.png')}
              />
              {/* <Image
                style={styles.pharmacyImage}
                source={{ uri: pharmacy.image }}
              /> */}
              <View style={styles.pharmacyInfo}>
                <Text style={styles.pharmacyName}>{pharmacy.userInfo.name}</Text>
                <Text style={styles.pharmacyLocation}>{`${pharmacy.userInfo.street}, ${pharmacy.userInfo.barangay}, ${pharmacy.userInfo.city}`}</Text>
                <Text style={styles.pharmacyLocation}>{pharmacy.userInfo.contactNumber}</Text>
                {/* <Text style={styles.pharmacyLocation}>{pharmacy.}</Text> */}
                {/* <Text style={styles.storeHours}>Store Hours: {pharmacy.storeHours}</Text> */}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Medications Section */}
     {/* Medications Section */}
      <Text style={styles.sectionTitle}>Medications</Text>
      {medications.map((medication) => (
        <TouchableOpacity
          key={medication._id}
          style={styles.productCard}
          onPress={() => router.push('/screens/User/Features/MedicationDetails')}
        >
          <Image
            style={styles.productImage}
            source={{ uri: medication.images && medication.images.length > 0 ? medication.images[0] : 'https://via.placeholder.com/100' }} // Fallback image if no images available
          />
          <View>
            <Text style={styles.productName}>{medication.name}</Text>
            {/* Display the category below the medicine name */}
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },

  categories: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  categoryCard: { width: '48%', marginVertical: 10 },
  categoryImage: { width: '100%', height: 100, borderRadius: 10 },
  categoryText: { textAlign: 'center', marginTop: 5 },

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
    flexWrap: 'wrap', // Ensure the address wraps within the container
    maxWidth: '80%', // Prevent overflow by limiting width
    marginTop: 5, // Add some margin for spacing
  },
  storeHours: {
    fontSize: 14,
    color: '#005b7f',
    textAlign: 'center',
    marginTop: 5,
  },

  productCard: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderRadius: 10, marginVertical: 10 },
  productImage: { width: 100, height: 100, borderRadius: 10, marginRight: 10 },
  productName: { fontSize: 16, fontWeight: 'bold' },
    productCategory: {
      fontSize: 14,
      color: '#888', 
      marginTop: 5, 
    },
  productPrice: { fontSize: 14, color: 'green' },
  pharmacyInfo: { fontSize: 14, color: '#666', marginTop: 5 },
  pharmacyBarangay: { fontSize: 14, color: '#666' },
});


export default HomeScreen;
