import React, { useState, useEffect } from 'react'; 
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; // For icons 
import { useRouter } from 'expo-router'; 
import axios from 'axios'; 
import baseURL from '@/assets/common/baseurl'; // Ensure this points to the right URL

const ViewAllMedications = () => { 
  const [medications, setMedications] = useState([]); // To store fetched medications 
  const router = useRouter(); 

  useEffect(() => {
    // Fetch the medications from your API
    axios
      .get(`${baseURL}medicine`) // Ensure this endpoint fetches the medications correctly
      .then((response) => {
        setMedications(response.data); // Set the fetched data to state
      })
      .catch((error) => {
        console.error('Error fetching medications:', error);
      });
  }, []);

  return (
    <View style={styles.topContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Available Medications</Text>
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.medicationsGrid}>
          {medications.map((medication, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.medicationCard} 
              onPress={() => router.push(`/screens/User/Features/MedicationDetails?id=${medication._id}`)}
            >
              <Image
                style={styles.medicationImage}
                source={{ uri: medication.images && medication.images.length > 0 ? medication.images[0] : 'https://via.placeholder.com/150' }} // Use the first image from the array or a placeholder
              />
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <Text style={styles.medicationPrice}>Stock: {medication.stock}</Text>
                <Text style={styles.pharmacyName}>{medication.pharmacy.userInfo.name}</Text>
                <Text style={styles.pharmacyBarangay}>{medication.pharmacy.userInfo.barangay}</Text>
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
    backgroundColor: '#FFFFFF', // White background
  },
  header: {
    backgroundColor: '#0B607E', // Dark header background
    paddingTop: 60,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  container: { 
    flex: 1, 
    paddingHorizontal: 16, 
  },
  medicationsGrid: {
    flexDirection: 'row', // Display medications in rows
    flexWrap: 'wrap', // Allows wrapping to the next row
    justifyContent: 'space-between', // Distribute space evenly
  },
  medicationCard: { 
    width: '48%', // Two cards per row
    padding: 10,
    backgroundColor: '#fff', 
    borderRadius: 12, // Slightly larger border radius
    marginVertical: 10,
    elevation: 4, // Adding shadow effect
    borderColor: '#B0BEC5', // Light border color
    borderWidth: 1, // Border width
  },
  medicationImage: { 
    width: '100%', // Full width of the card
    height: 120, // Set a fixed height for the image
    borderRadius: 10, 
    marginBottom: 10, // Space between image and text
  },
  medicationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  medicationName: { 
    fontSize: 16, 
    fontWeight: 'bold',
    color: '#333',
  },
  medicationDescription: { 
    fontSize: 14, 
    color: '#555', 
    marginBottom: 5 
  },
  medicationPrice: {
    fontSize: 14, 
    fontWeight: 'bold',
    color: '#00796B', 
    marginBottom: 5
  },
  pharmacyName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  pharmacyBarangay: {
    fontSize: 14,
    color: '#777',
  },
});

export default ViewAllMedications;
