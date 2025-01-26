import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl'; // Update to your base URL

export default function CreateBarangay() {
  const router = useRouter();

  // State for barangay details
  const [name, setName] = useState('');

  const handleCreate = async () => {
    const formData = new FormData();

    // Append other barangay data
    formData.append('name', name);

    try {
      // Make POST request to create barangay
      const config = {
        headers: {
          "Content-Type": "application/json"
        }
      };
      const response = await axios.post(`${baseURL}barangays/create`, formData, config);     
      if (response.data) {
        Alert.alert('Success', 'Barangay created successfully');
        router.push('/screens/Admin/Barangay/ListBarangay')
      }
    } catch (error) {
      console.error('Error creating barangay:', error);
      Alert.alert('Error', 'Failed to create barangay');
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Create Barangay</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Barangay Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter barangay name"
        />
      </View>

  
      <TouchableOpacity style={styles.confirmButton} onPress={handleCreate}>
        <Text style={styles.confirmButtonText}>CREATE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    backgroundColor: '#005b7f',
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
    marginBottom: 20,
    marginTop: 20
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
    backgroundColor: '#005b7f',
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
