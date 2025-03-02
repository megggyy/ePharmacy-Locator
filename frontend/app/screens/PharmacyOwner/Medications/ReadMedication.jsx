import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';

export default function ReadMedicationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get the medication ID from route params
  const [medicationData, setMedicationData] = useState(null);
  const [category, setCategory] = useState("");
  const [isCategory, setIsCategory] = useState(true); // Toggle state

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const response = await axios.get(`${baseURL}medicine/read/${id}`);
        setMedicationData(response.data);
        console.log('medicationdata:', medicationData)
      } catch (error) {
        console.error('Error fetching medication:', error.response?.data || error.message);
        Alert.alert('Error', 'Failed to load medication details');
      }
    };

    if (id) fetchMedication();
  }, [id]);

  useEffect(() => {
    if (medicationData?.medicine?.category) {
      const newCategory = Array.isArray(medicationData.medicine.category)
        ? medicationData.medicine.category.map((cat) => cat.name).join('/ ')
        : medicationData.medicine.category?.name || 'No Category';

      setCategory(newCategory);
    }
  }, [medicationData]); // Runs when medicationData updates

  const handleCategoryClick = () => {
    setIsCategory((prev) => !prev); // Toggle between true/false
  };

  if (!medicationData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
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
        <Text style={styles.title}>{medicationData.medicine.brandName}</Text>
      </View>

      {/* Medication Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Generic Name:</Text>
        <Text style={styles.value}>{medicationData.medicine.genericName}</Text>
        <Text style={styles.label}>Dosage Strength:</Text>
        <Text style={styles.value}>{medicationData.medicine.dosageStrength}</Text>
        <Text style={styles.label}>Dosage Form:</Text>
        <Text style={styles.value}>{medicationData.medicine.dosageForm}</Text>
        <Text style={styles.label}>Classification:</Text>
        <Text style={styles.value}>{medicationData.medicine.classification}</Text>
        <Text style={styles.label}>Category:</Text>
        <Text style={styles.value} onPress={handleCategoryClick}>
          {isCategory
            ? category || "No Category"
            : medicationData?.medicine?.description || "No Description"}
        </Text>




        <View style={styles.expirationStock}>
          <View style={styles.expirationDate}>
            <Text style={styles.label}>Expiration Date:</Text>
          </View>
          <View style={styles.stock}>
            <Text style={styles.label}>Stock:</Text>
          </View>
        </View>

        {medicationData.expirationPerStock?.length > 0 ? (
          medicationData.expirationPerStock.map((exp, index) => {



            return (
              <View key={index} style={styles.expirationStock}>
                <View style={styles.expirationDate}>
                  <Text style={styles.value}>{exp.expirationDate}</Text>
                </View>
                <View style={styles.stock}>
                  <Text style={styles.value}>{exp.stock}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.value}>No Expiration Data</Text>
        )}


      </View>
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
    margin: 20
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
    textAlign: 'justify'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expirationStock: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Space out the columns
    alignItems: 'center', // Align items at the start of each column
  },
  expirationDate:
  {
    width: '60%'
  },
  stock:
  {
    width: '35%'
  }
});
