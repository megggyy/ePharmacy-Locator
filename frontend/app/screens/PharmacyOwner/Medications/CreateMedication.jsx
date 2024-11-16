import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';

export default function CreateMedication() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [pharmacyId, setPharmacyId] = useState('');  // Changed to pharmacyId
  const [categoryId, setCategoryId] = useState('');
  const [imageUris, setImageUris] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        // Fetch users with the role 'PharmacyOwner'
        const pharmaciesResponse = await axios.get(`${baseURL}pharmacies`);
        
        // Extract pharmacy details from users
        setPharmacies(pharmaciesResponse.data.map(pharmacies => ({
            label: pharmacies.userInfo.name,  // Display the pharmacy owner's name
            value: pharmacies._id  // Store the pharmacy ID
        })));
      } catch (error) {
        console.error('Error fetching pharmacies:', error);
        Alert.alert('Error', 'Failed to load pharmacies');
      }
    };
    fetchPharmacies();
  }, []);


//   useEffect(() => {
//     const fetchPharmacies = async () => {
//       try {
//         // Fetch pharmacies
//         const response = await axios.get(`${baseURL}pharmacies`);
        
//         // Map pharmacy details for RNPickerSelect
//         setPharmacies(response.data.map(pharmacy => ({
//           label: pharmacy.userInfo.name,  // Display the pharmacy owner's name
//           value: pharmacy._id  // Store the pharmacy ID
//         })));
//       } catch (error) {
//         console.error('Error fetching pharmacies:', error);
//         Alert.alert('Error', 'Failed to load pharmacies');
//       }
//     };
//     fetchPharmacies();
//   }, []);

  // Fetch categories when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchCategories = async () => {
        try {
          const response = await axios.get(`${baseURL}medication-category`); 
          setCategories(response.data.map(category => ({
            label: category.name,
            value: category._id
          })));
        } catch (error) {
          console.error('Error fetching categories:', error);
          Alert.alert('Error', 'Failed to load categories');
        }
      };
      fetchCategories();
    }, [])
  );

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUris([...imageUris, result.assets[0].uri]);
    }
  };

  const handleCreate = async () => {
    const formData = new FormData();

    imageUris.forEach((uri, index) => {
      const filename = uri.split('/').pop();
      const type = `image/${filename.split('.').pop()}`;
      formData.append('images', {
        uri,
        name: filename,
        type,
      });
    });

    formData.append('name', name);
    formData.append('description', description);
    formData.append('stock', stock);
    formData.append('pharmacy', pharmacyId);  // Changed to pharmacyId
    formData.append('category', categoryId);

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      };
      const response = await axios.post(`${baseURL}medicine/create`, formData, config);
      if (response.data) {
        Alert.alert('Success', 'Medication created successfully');
        router.back();
      }
    } catch (error) {
      console.error('Error creating medication:', error);
      Alert.alert('Error', 'Failed to create medication');
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Create Medication</Text>
      </View>

      <View style={styles.imageSection}>
        {imageUris.length > 0 ? (
          imageUris.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.medicineImage} />
          ))
        ) : (
          <Image source={require('@/assets/images/sample.jpg')} style={styles.medicineImage} />
        )}
        <TouchableOpacity onPress={pickImage} style={styles.selectImageButton}>
          <Text style={styles.selectImageText}>Select Images</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Medication Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter medication name"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
        />

        <Text style={styles.label}>Stock</Text>
        <TextInput
          style={styles.input}
          value={stock}
          onChangeText={setStock}
          keyboardType="numeric"
          placeholder="Enter stock quantity"
        />

        <Text style={styles.label}>Pharmacy</Text>
        {/* <RNPickerSelect
          onValueChange={(value) => setPharmacyId(value)}  // Changed to pharmacyId
          items={pharmacies}
          style={pickerSelectStyles}
          placeholder={{ label: "Select a pharmacy", value: null }}
        /> */}
         <RNPickerSelect
        onValueChange={(value) => setPharmacyId(value)}
        items={pharmacies}
        placeholder={{ label: 'Select Pharmacy', value: null }}
        style={pickerSelectStyles}
        Icon={() => <Ionicons name="chevron-down" size={24} color="#AAB4C1" />}
      />
      
  

        <Text style={styles.label}>Category</Text>
        {/* <RNPickerSelect
          onValueChange={(value) => setCategoryId(value)}
          items={categories}
          style={pickerSelectStyles}
          placeholder={{ label: "Select a category", value: null }}
        /> */}

    <RNPickerSelect
        onValueChange={(value) => setCategoryId(value)}
        items={categories}
        placeholder={{ label: 'Select Category', value: null }}
        style={pickerSelectStyles}
        Icon={() => <Ionicons name="chevron-down" size={24} color="#AAB4C1" />}
      />
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleCreate}>
        <Text style={styles.confirmButtonText}>CREATE</Text>
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
  imageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  medicineImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectImageButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  selectImageText: {
    color: '#555',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
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