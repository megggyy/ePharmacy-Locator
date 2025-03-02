import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';

const CategoryFilterMedications = () => {
  const router = useRouter();
  const { id, name } = useLocalSearchParams(); // Extract category ID and name from query params
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);  // Loading state
  const [error, setError] = useState(false); // Error state

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setIsLoading(true);
        setError(null); // Reset error state
        const response = await axios.get(`${baseURL}medicine/category/${id}`);
        
        // Filter unique genericName values
       
  
        setMedications(response.data);
      } catch (err) {
        setError('Failed to load medications. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchMedications();
  }, [id]);
  
  

  return (
    <View style={styles.topContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{name}</Text>
      </View>
      
      <ScrollView style={styles.container}>
        {/* Display Loading State */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#0B607E" style={styles.loader} />
        ) : error ? (
          // Display Error and Retry Button
          <View style={styles.errorContainer}>
            <Text style={styles.noText}>There are no medicines in this category.</Text>
    
          </View>
        ) : (
          // Display Medications or "No Medications" Message
          <View style={styles.medicationsGrid}>
            {medications.length > 0 ? (
              medications.map((medication) => (
                <TouchableOpacity
                  key={medication._id}
                  style={styles.medicationCard}
                  onPress={() => router.push(`/screens/User/Features/MedicationDetails?name=${medication.genericName}`)}
                >
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>{medication.brandName}</Text>
                    <Text style={styles.genericName}>{medication.genericName}</Text>

                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noMedicationsText}>
                No medications found in the "{name}" category.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#0B607E',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  medicationCard: {
    width: '48%',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 10,
    elevation: 4,
    borderColor: '#B0BEC5',
    borderWidth: 1,
  },
  medicationImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
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
    marginBottom: 5,
  },
  medicationPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00796B',
  },
  noMedicationsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  loader: {
    marginTop: 50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noText: {
    fontSize: 18,
    color: '#0B607E',
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#0B607E',
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default CategoryFilterMedications;
