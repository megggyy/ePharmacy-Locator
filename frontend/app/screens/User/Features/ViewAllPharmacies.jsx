import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For icons
import { useRouter } from 'expo-router';
import axios from 'axios'; // For making API requests
import baseURL from '@/assets/common/baseurl'; // Import the base URL

const ViewAllPharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]); // State to hold pharmacies data
  const router = useRouter();

  useEffect(() => {
    // Fetch the pharmacies data from the API
    axios
      .get(`${baseURL}pharmacies`) // Replace with the correct endpoint for pharmacies
      .then((response) => {
        const pharmaciesData = response.data;
  
        // Filter pharmacies to include only approved ones
        const approvedPharmacies = pharmaciesData.filter(pharmacy => pharmacy.approved);
  
        // Update state with approved pharmacies
        setPharmacies(approvedPharmacies);

      })
      .catch((error) => {
        console.error('Error fetching pharmacies:', error);
      });
  }, []);
  

  return (
    <View style={styles.topContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Available Pharmacies</Text>
      </View>
      <ScrollView style={styles.container}>
        {/* Pharmacies Grid */}
        <View style={styles.pharmaciesGrid}>
          {pharmacies.map((pharmacy, index) => (
            <TouchableOpacity
              key={index}
              style={styles.pharmacyCard}
              onPress={() => router.push(`/screens/User/Features/PharmacyDetails?id=${pharmacy._id}`)} // Pass the pharmacy ID
            >
               <Image
                style={styles.pharmacyImage}
                source={
                  pharmacy?.images?.[0]
                    ? { uri: pharmacy.images[0] }
                    : require('@/assets/images/sample.jpg')
                }
              />
              <View>
                <Text style={styles.pharmacyName}>{pharmacy.userInfo.name}</Text>
                <Text style={styles.pharmacyAddress}>{`${pharmacy.userInfo.street || ''}, ${pharmacy.userInfo.barangay || ''}, ${pharmacy.userInfo.city || ''}`.replace(/(, )+/g, ', ').trim()}</Text>
                <Text style={styles.barangayText}>{pharmacy.userInfo.contactNumber}</Text>
                <Text style={styles.pharmacyHours}>
                  {`${pharmacy.businessDays} (${pharmacy?.openingHour || 'N/A'} - ${pharmacy?.closingHour || 'N/A'})`}
                </Text>
                {/* <Text style={styles.storeHoursText}>{pharmacy.storeHours}</Text> */}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    backgroundColor: '#0B607E', // Blue header background, full width
    paddingTop: 80,
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
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#fff' },
  pharmaciesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pharmacyCard: {
    width: '48%', // Two items in a row
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 10,
    borderColor: '#B0BEC5', // Light border color
    borderWidth: 1, // Border width
  },
  pharmacyImage: { width: '100%', height: 180, borderRadius: 10, marginBottom: 10 },
  pharmacyName: { fontSize: 16, fontWeight: 'bold' },
  pharmacyAddress: { fontSize: 12, color: '#666', marginTop: 5 },
  barangayText: { fontSize: 12, color: '#666', marginTop: 5 },
  storeHoursText: { fontSize: 12, color: '#666', marginTop: 5 },
  pharmacyHours: {
    fontSize: 12,
    color: '#999',
  },
});

export default ViewAllPharmacies;
