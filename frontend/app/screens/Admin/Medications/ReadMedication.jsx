import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';
import Spinner from "../../../../assets/common/spinner";

export default function ReadMedicationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get the medication ID from route params
  const [medicationData, setMedicationData] = useState(null);
  const [category, setCategory] = useState("");
  const [isCategory, setIsCategory] = useState(true); // Toggle state

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const response = await axios.get(`${baseURL}medicine/admin/read/${id}`);
        console.log('Fetched medicationData:', response.data); // Debugging log
        setMedicationData(response.data);
      } catch (error) {
        console.error('Error fetching medication:', error.response?.data || error.message);
        Alert.alert('Error', 'Failed to load medication details');
      }
    };

    if (id) fetchMedication();
  }, [id]);

  useEffect(() => {
    if (Array.isArray(medicationData) && medicationData.length > 0) {
      const newCategory = Array.isArray(medicationData[0].medicine.category)
        ? medicationData[0].medicine.category.map((cat) => cat.name).join('/ ')
        : medicationData[0].medicine.category?.name || 'No Category';

      setCategory(newCategory);
    }
  }, [medicationData]); // Runs when medicationData updates

  const handleCategoryClick = () => {
    setIsCategory((prev) => !prev); // Toggle between true/false
  };

  // Handle loading state
  if (!medicationData) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner />
      </View>
    );
  }

  // Extract medicine and pharmacy data
  const medication = Array.isArray(medicationData) ? medicationData[0] : medicationData;
  const medicine = medication?.medicine;
  const pharmacy = medication?.pharmacy;

  if (!medicine) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No medication data found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>{medicine.brandName}</Text>
      </View>
      <ScrollView>
        {/* Medication Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Generic Name:</Text>
          <Text style={styles.value}>{medicine.genericName || 'N/A'}</Text>

          <Text style={styles.label}>Dosage Strength:</Text>
          <Text style={styles.value}>{medicine.dosageStrength || 'N/A'}</Text>

          <Text style={styles.label}>Dosage Form:</Text>
          <Text style={styles.value}>{medicine.dosageForm || 'N/A'}</Text>

          <Text style={styles.label}>Classification:</Text>
          <Text style={styles.value}>{medicine.classification || 'N/A'}</Text>

          <Text style={styles.label}>Category:</Text>
          <Text style={styles.value} onPress={handleCategoryClick}>
            {isCategory
              ? category || "No Category"
              : medicine?.description || "No Description"}
          </Text>
        </View>

        {/* Pharmacy Information */}
        <View style={styles.pharmacyContainer}>
          <Text style={styles.pharmacyTitle}>LIST OF PHARMACIES</Text>
        </View>

        {pharmacy ? (


          <View style={styles.infoContainer}>
            <View style={styles.detailsContainer}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{pharmacy.userInfo?.name || 'N/A'}</Text>

              <Text style={styles.label}>Location:</Text>
              <Text style={styles.value}>{`${pharmacy.userInfo?.street}, ${pharmacy.userInfo?.barangay}, ${pharmacy.userInfo?.city}`}</Text>

              <Text style={styles.label}>Contact:</Text>
              <Text style={styles.value}>{pharmacy.userInfo?.contactNumber || 'N/A'}</Text>

              <Text style={styles.label}>Availability:</Text>
              <Text style={styles.value}>{pharmacy.businessDays || 'N/A'} from {pharmacy.openingHour || 'N/A'} - {pharmacy.closingHour || 'N/A'}</Text>

              {/* Expiration & Stock Details */}
              <View style={styles.expirationStock}>
                <View style={styles.expirationDate}>
                  <Text style={styles.label}>Expiration Date:</Text>
                </View>
                <View style={styles.stock}>
                  <Text style={styles.label}>Stock:</Text>
                </View>
              </View>

              {medication.expirationPerStock?.length > 0 ? (
                medication.expirationPerStock.map((exp, index) => (
                  <View key={index} style={styles.expirationStock}>
                    <View style={styles.expirationDate}>
                      <Text style={styles.value}>{exp.expirationDate}</Text>
                    </View>
                    <View style={styles.stock}>
                      <Text style={styles.value}>{exp.stock}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.value}>No Expiration Data</Text>
              )}
            </View>
          </View>

        ) : (
          <Text style={styles.value}>No Pharmacy Data</Text>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#005b7f',
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 20,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  value: {
    backgroundColor: '#F4F4F4',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 15,
    textAlign: 'justify',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pharmacyContainer: {
    marginVertical: 0,
    padding: 10,
    backgroundColor: '#005b7f',
    borderRadius: 10,
    margin: 20,
  },
  pharmacyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'white',
    textAlign: 'center',
  },
  expirationStock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: {
    backgroundColor: '#005b7f',
    borderRadius: 10,
    margin: 20,
    marginBottom: 30
  },
  expirationDate: {
    width: '60%',
  },
  stock: {
    width: '35%',
  },
});
