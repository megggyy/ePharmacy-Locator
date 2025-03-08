import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';
import { Ionicons } from '@expo/vector-icons';

const FilterMedicinesByCategoryPerPharmacy = () => {
  const router = useRouter();
  const { category, pharmacyId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState([]);
  const [searchText, setSearchText] = useState(""); // 🔍 Search state

  useEffect(() => {
    const fetchMedicinesByCategory = async () => {
      try {
        console.log('Fetching medicines for:', { category, pharmacyId });

        // ✅ Fetch pharmacy stock
        const response = await axios.get(`${baseURL}medicine/features/${pharmacyId}`);
        console.log('API Response:', response.data); 

        // ✅ Filter medicines by category (handling category as an array)
        const filtered = response.data.filter(med => 
          med.medicine?.category?.some(cat => cat.name === category) 
        );

        console.log('Filtered Medicines:', filtered);
        setMedicines(filtered);
      } catch (error) {
        console.error('Error fetching medicines:', error);
      } finally {
        setLoading(false);
      }
    };      

    fetchMedicinesByCategory();
  }, [category, pharmacyId]);

  // 🔍 Filter medicines based on search input
  const filteredMedicines = medicines.filter(item => {
    const medDetails = item.medicine || {};
    const brandName = medDetails.brandName?.toLowerCase() || "";
    const genericName = medDetails.genericName?.toLowerCase() || "";
    return brandName.includes(searchText.toLowerCase()) || genericName.includes(searchText.toLowerCase());
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B607E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{category} Medicines</Text>
      </View>
  {/* 🔍 Search Bar */}
  <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by brand or generic name"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <ScrollView contentContainerStyle={styles.medicineContainer}>
        {filteredMedicines.length > 0 ? (
          filteredMedicines.map((item, index) => {
            const medDetails = item.medicine || {};
            const categoryNames = medDetails.category ? medDetails.category.map(cat => cat.name).join(' / ') : 'No Category';
            const totalStock = item.expirationPerStock?.reduce((sum, stockItem) => sum + stockItem.stock, 0) || 0;

            return (
              <TouchableOpacity
                key={index}
                style={styles.medicineCard}
                onPress={() => {
                  console.log('Navigating with:', {
                    medicineId: medDetails._id,  // Logging medicine ID
                    stockId: item._id,           // Logging stock ID
                    pharmacyId: pharmacyId
                  });

                  router.push(`/screens/User/Features/ViewPharmacyMedicine?id=${item._id}&pharmacyId=${pharmacyId}`);
                }}
              >
                <Text style={styles.medicineName}>{medDetails.brandName || 'Unknown'}</Text>
                <Text style={styles.medicineStock}>Generic: {medDetails.genericName || 'Unknown'}</Text>
                <Text style={styles.medicineStock}>Dosage: {medDetails.dosageStrength || 'N/A'}</Text>
                <Text style={styles.medicineStock}>Form: {medDetails.dosageForm || 'N/A'}</Text>
                <Text style={styles.medicineStock}>Classification: {medDetails.classification || 'N/A'}</Text>
                <Text style={styles.medicineStock}>Category: {categoryNames}</Text>
                <Text style={styles.medicineStock}>
                  Stock: {totalStock > 0 ? `${totalStock} in stock` : 'Out of Stock'}
                </Text>
                <Text style={styles.timestamp}>
                  (Last updated on {item.timeStamps ? new Date(item.timeStamps).toLocaleString() : 'No Date Available'})
                </Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.noMedicinesText}>No medicines found.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  
  // 🔍 Search Bar Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#005b7f',
    padding: 15,
  },
  backButton: { marginRight: 10 },
  headerText: { fontSize: 18, fontWeight: 'bold', color: 'white' },

  medicineContainer: { padding: 16 },
  medicineCard: { padding: 15, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10, elevation: 3 },
  medicineName: { fontSize: 16, fontWeight: 'bold' },
  medicineStock: { fontSize: 14, color: '#555' },
  timestamp: { fontSize: 12, color: 'red', marginTop: 5 },
  noMedicinesText: { textAlign: 'center', fontSize: 16, color: '#777', marginTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default FilterMedicinesByCategoryPerPharmacy;
