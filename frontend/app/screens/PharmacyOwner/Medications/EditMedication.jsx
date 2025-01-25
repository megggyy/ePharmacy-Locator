import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';
import RNPickerSelect from 'react-native-picker-select';

export default function EditMedicationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [categoryId, setCategoryId] = useState('');  // Store category ID
  const [stock, setStock] = useState('');
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pharmacy, setPharmacy] = useState('');
  const [pharmacyId, setPharmacyId] = useState('');  // Store pharmacy ID

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const response = await axios.get(`${baseURL}medicine/read/${id}`);
        const medication = response.data;
        setName(medication.name);
        setCategory(medication.category.name);  // Display category name
        setCategoryId(medication.category._id);  // Store category ID
        setStock(medication.stock.toString());
        setImages(medication.images || []);
        setPharmacy(medication.pharmacy.userInfo.name);  // Display pharmacy name
        setPharmacyId(medication.pharmacy._id);  // Store pharmacy ID
      } catch (error) {
        console.error('Error fetching medication:', error);
        Alert.alert('Error', 'Failed to load medication details');
      }
    };

    if (id) fetchMedication();
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${baseURL}medication-category`);
        setCategories(response.data.map(category => ({
          label: category.name,
          value: category._id,  // Use category ID for the value
        })));
      } catch (error) {
        console.error('Error fetching categories:', error);
        Alert.alert('Error', 'Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const handleSelectImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleDeleteImage = (uri) => {
    setImages(images.filter(image => image !== uri));
  };

  const handleConfirm = async () => {
    const formData = new FormData();

    formData.append('stock', stock);


    try {
      const config = {
        headers: {
          "Content-Type": "application/json"
        }
      };
      await axios.put(`${baseURL}medicine/update/${id}`, formData, config);
      Alert.alert('Success', 'Medication updated successfully');
      router.push('/screens/PharmacyOwner/Medications/ListMedications');
    } catch (error) {
      console.error('Error updating medication:', error);
      Alert.alert('Error', 'Failed to update medication');
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Medication</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.inputDisable}
          value={name}
          onChangeText={setName}
          editable={false}
        />

        <Text style={styles.label}>Category</Text>

        <Text style={styles.inputDisable}>
          {category || 'Loading...'}
        </Text>

        <Text style={styles.label}>Stock</Text>
        <TextInput
          style={styles.input}
          value={stock}
          onChangeText={setStock}
          keyboardType="numeric"
        />

      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>UPDATE</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    backgroundColor: '#0B607E',
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
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    margin: 20,
  },
  label: {
    color: '#666',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F4F4F4',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  inputDisable: {
    backgroundColor: '#D3D3D3',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  confirmButton: {
    backgroundColor: '#0B607E',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
    color: '#333',
    paddingRight: 30,
  },
  inputAndroid: {
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
    color: '#333',
    paddingRight: 30,
  },
  iconContainer: {
    top: 15,
    right: 10,
  },
});
