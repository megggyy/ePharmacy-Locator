import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import baseURL from '@/assets/common/baseurl';

export default function EditMedicationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [medicationData, setMedicationData] = useState(null);
  const [stocks, setStocks] = useState({});
  const [expirationDates, setExpirationDates] = useState({});
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [category, setCategory] = useState("");
  const [isCategory, setIsCategory] = useState(true); // Toggle state

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const response = await axios.get(`${baseURL}medicine/read/${id}`);
        setMedicationData(response.data);

        const initialStocks = {};
        const initialExpirations = {};
        response.data.expirationPerStock.forEach((exp, index) => {
          initialStocks[index] = exp.stock.toString();

          let parsedDate = new Date(exp.expirationDate);
          initialExpirations[index] = !isNaN(parsedDate)
            ? parsedDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: '2-digit',
            })
            : exp.expirationDate;
        });

        setStocks(initialStocks);
        setExpirationDates(initialExpirations);
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

  const handleConfirm = async () => {
    const updatedData = Object.keys(stocks).map((index) => {
      let rawDate = expirationDates[index];

      let parsedDate = new Date(rawDate);
      let isoDate = !isNaN(parsedDate) ? parsedDate.toISOString().split('T')[0] : rawDate;

      let stockValue = parseInt(stocks[index], 10) || 0;

      return { expirationDate: isoDate, stock: stockValue };
    });

    try {
      await axios.put(`${baseURL}medicine/update/${id}`, { expirationPerStock: updatedData });
      Alert.alert('Success', 'Medication updated successfully');
      router.push('/screens/PharmacyOwner/Medications/ListMedications');
    } catch (error) {
      console.error('Error updating medication:', error);
      Alert.alert('Error', 'Failed to update medication');
    }
  };

  const showDatePicker = (index) => {
    setSelectedIndex(index);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (date) => {
    let formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    }).format(date);

    setExpirationDates((prev) => ({
      ...prev,
      [selectedIndex]: formattedDate,
    }));

    hideDatePicker();
  };

  // **✅ Add New Expiration & Stock Entry**
  const addNewItem = () => {
    const newIndex = Object.keys(stocks).length;
    setStocks((prev) => ({ ...prev, [newIndex]: '' }));
    setExpirationDates((prev) => ({ ...prev, [newIndex]: '' }));
  };

  // **❌ Remove Specific Expiration & Stock Entry**
  const removeItem = (index) => {
    const updatedStocks = { ...stocks };
    const updatedExpirations = { ...expirationDates };

    delete updatedStocks[index];
    delete updatedExpirations[index];

    setStocks(updatedStocks);
    setExpirationDates(updatedExpirations);
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit {medicationData?.medicine?.brandName || ''}</Text>
      </View>

      {medicationData ? (
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Generic Name:</Text>
          <Text style={styles.value}>{medicationData.medicine?.genericName || ''}</Text>
          <Text style={styles.label}>Dosage Strength:</Text>
          <Text style={styles.value}>{medicationData.medicine?.dosageStrength || ''}</Text>
          <Text style={styles.label}>Dosage Form:</Text>
          <Text style={styles.value}>{medicationData.medicine?.dosageForm || ''}</Text>
          <Text style={styles.label}>Classification:</Text>
          <Text style={styles.value}>{medicationData.medicine?.classification || ''}</Text>
          <Text style={styles.label}>Category:</Text>
          <Text style={styles.value} onPress={handleCategoryClick}>
            {isCategory
              ? category || "No Category"
              : medicationData?.medicine?.description || "No Description"}
          </Text>
          <View style={styles.expirationItems}>

            <View style={styles.expirationStock}>
              <View style={styles.expirationDate}>
                <Text style={styles.label}>Expiration Date:</Text>
              </View>
              <View style={styles.stock}>
                <Text style={styles.label}>Stock:</Text>
              </View>
            </View>
            {Object.keys(stocks).length > 0 ? (
              Object.keys(stocks).map((index) => (
                <View key={index} style={styles.expirationStock}>
                  {/* Expiration Date Picker */}
                  <TouchableOpacity onPress={() => showDatePicker(index)} style={styles.expiInput}>
                    <Text>{expirationDates[index] || 'Select Date'}</Text>
                  </TouchableOpacity>

                  {/* Stock Input */}
                  <TextInput
                    style={styles.stockInput}
                    value={stocks[index]}
                    keyboardType="numeric"
                    onChangeText={(text) => setStocks((prev) => ({ ...prev, [index]: text }))}
                  />

                  {/* ❌ Remove Button */}
                  <TouchableOpacity onPress={() => removeItem(index)} style={styles.removeButton}>
                    <Ionicons name="trash" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.value}>No Expiration Data</Text>
            )}

            {/* ➕ Add Button */}
            <TouchableOpacity style={styles.addButton} onPress={addNewItem}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.submit} onPress={handleConfirm}>
            <Text style={styles.submitText}>UPDATE</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      )}

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#005b7f', paddingVertical: 20, alignItems: 'center' },
  headerText: { fontSize: 25, color: 'white', fontWeight: 'bold' },
  backButton: { position: 'absolute', top: 20, left: 20 },
  detailsContainer: { backgroundColor: 'white', borderRadius: 10, padding: 20, margin: 20 },
  label: { fontWeight: 'bold', fontSize: 18, marginBottom: 5 },
  value: { backgroundColor: 'lightgrey', borderRadius: 5, padding: 10, marginBottom: 15 },
  expiInput: { backgroundColor: '#F4F4F4', borderRadius: 5, padding: 10, textAlign: 'center', width: '60%' },
  stockInput: { backgroundColor: '#F4F4F4', borderRadius: 5, padding: 10, marginHorizontal: 10, textAlign: 'center', width: '20%' },
  removeButton: { padding: 10, textAlign: 'center', width: '15%' },
  expirationItems: {
    display: 'flex',
    justifyContent: 'center', // Centers children horizontally
    alignItems: 'center', // Centers children vertically
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
  },

  submit: { backgroundColor: '#0B607E', paddingVertical: 15, borderRadius: 10, marginVertical: 20, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addButton: {
    backgroundColor: 'none',
    alignItems: 'center',
    width: 50,
    marginTop: 10
  },
  addButtonText: {
    color: '#0B607E',
    fontSize: 25,
    fontWeight: 'bold',
  },
});

