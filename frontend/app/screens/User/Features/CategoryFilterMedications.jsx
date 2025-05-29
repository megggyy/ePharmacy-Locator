import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';
import Spinner from "@/assets/common/spinner";


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
      {isLoading ? (
        <Spinner />
      ) : error ? (
        // Display Error and Retry Button
        <View style={styles.errorContainer}>
          <Text style={styles.noText}>There are no medicines in this category.</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerText}>{name}</Text>
          </View>

          <ScrollView style={styles.container}>
            <View style={styles.medicationContainer}>
              {medications.length > 0 ? (
                medications.map((medication) => (
                  <TouchableOpacity
                    key={medication._id}
                    style={styles.medicineHeader}
                    onPress={() => {
                      const encodedName = encodeURIComponent(medication.genericName);
                      router.push(`/screens/User/Features/MedicationDetails?name=${encodedName}`);
                    }}
                  >
                    <View style={styles.medicationCard}>
                      <Text style={styles.medicationName}>{medication.brandName}</Text>
                      <Text style={styles.genericName}>{medication.genericName || 'Unknown'}</Text>
                      <View style={styles.medicineDetails}>
                        <Text style={styles.detailText}>💊 Dosage: {medication.dosageStrength || 'N/A'}</Text>
                        <Text style={styles.detailText}>📌 Form: {medication.dosageForm || 'N/A'}</Text>
                        <Text style={styles.detailText}>📂 Classification: {medication.classification || 'N/A'}</Text>
                        <Text style={styles.detailText}>
                          📋 Category: {medication.category.map((cat) => cat.name).join(' / ')}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noMedicationsText}>
                  No medications found in the "{name}" category.
                </Text>
              )}
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );

};

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#005b7f',
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
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
  medicationContainer: { marginTop: 15 },
  medicationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
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
    marginTop: 10
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

  medicineName: { fontSize: 18, fontWeight: 'bold', color: '#005b7f' },
  genericName: { fontSize: 16, fontStyle: 'italic', color: '#333', marginBottom: 8 },
  medicineDetails: { marginTop: 6 },
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
