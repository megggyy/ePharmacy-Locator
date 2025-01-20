import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ScrollView, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import medicines from '../../../../assets/medicines'; // Now this will contain the merged array of all medicines

const PrescriptionScreen = () => {
  const router = useRouter();
  const { imageUrl, ocrText } = useLocalSearchParams();

  const [selectedText, setSelectedText] = useState('');
  const [medicinesList, setMedicinesList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility
  const [quantity, setQuantity] = useState(''); // State to store input quantity
  const [selectedMedicine, setSelectedMedicine] = useState(null); // State to store the selected medicine

  useEffect(() => {
    setMedicinesList(medicines);
  }, []);
  
  const handleSelectText = (text) => {
    setSelectedText(text);
    setIsModalVisible(true); // Show the modal to input quantity
  };

  const handleSaveQuantity = () => {
    if (!quantity) {
      Alert.alert('Please enter a quantity');
    } else {
      // Perform the action with the selected medicine and entered quantity
      console.log(`Selected Medicine: ${selectedText}, Quantity: ${quantity}`);
      
      // Navigate to the next screen with selected medicine and quantity as params
      router.push({
        pathname: '/screens/User/Features/PrescriptionResults',
        params: {
          selectedText: selectedText,
          quantity: quantity, // Pass the quantity along with the selected medicine
        },
      });
  
      setIsModalVisible(false); // Close the modal
      setQuantity(''); // Reset quantity input
    }
  };

  const getMatchedMedicines = () => {
    if (!ocrText) return [];
  
    const ocrWords = ocrText.split(/\s+|\n+/).map(word => word.toLowerCase()).filter(Boolean);
  
    const matchedMedicines = medicinesList.filter(medicine => {
      return ocrWords.some(word => {
        const medicineName = medicine.name.toLowerCase();
        const lowerWord = word.toLowerCase();
        return medicineName.startsWith(lowerWord);
      });
    });
  
    return matchedMedicines;
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={styles.iconBackground}>
            <Ionicons name="arrow-back" size={24} color="#005b7f" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Uploaded Prescription</Text>
      </View>

      <ScrollView style={styles.scrollableContent}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.prescriptionImage}
            resizeMode="contain"
          />
        ) : (
          <Text>No image to display</Text>
        )}

        <Ionicons name="arrow-down" size={100} color="black" style={styles.arrowDown} />

        <View style={styles.matchedMedicinesContainer}>
          {getMatchedMedicines().length > 0 ? (
            getMatchedMedicines().map((medicine, index) => (
              <TouchableOpacity
                key={index}
                style={styles.scanButton}
                onPress={() => handleSelectText(medicine.name)} // Pass the medicine to the handler
              >
                <Text style={styles.scanButtonText}>{medicine.name}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text>No medicines found in the OCR text.</Text>
          )}
        </View>
      </ScrollView>

      {/* Modal for inputting quantity */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedText}</Text>
            <TextInput
              style={styles.input}
              placeholder="Input Quantity"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleSaveQuantity}>
                <Text style={styles.modalButtonText}>Find</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIsModalVisible(false)} // Close modal without saving
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 30,
    backgroundColor: '#005b7f',
  },
  backButton: {
    marginRight: 10,
  },
  iconBackground: {
    marginTop: 28,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    marginTop: 28,
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  scrollableContent: {
    flex: 1,
  },
  prescriptionImage: {
    width: 400,
    height: 300,
    margin: 25,
    marginBottom: 0,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 10,
  },
  arrowDown: {
    alignSelf: 'center',
  },
  matchedMedicinesContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    marginTop: 0,
  },
  scanButton: {
    width: '90%',
    height: 50,
    backgroundColor: '#005b7f',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#005b7f',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default PrescriptionScreen;
