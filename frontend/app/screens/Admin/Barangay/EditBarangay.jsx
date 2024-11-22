import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';

export default function EditBarangay() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchBarangay = async () => {
      try {
        const response = await axios.get(`${baseURL}barangays/${id}`);
        const barangay = response.data;
        setName(barangay.name);
      } catch (error) {
        console.error('Error fetching barangay:', error);
        Alert.alert('Error', 'Failed to load barangay details');
      }
    };
    if (id) fetchBarangay();
  }, [id]);

  const handleConfirm = async () => {
    const formData = new FormData();
    formData.append('name', name);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json"
        }
      };
      await axios.put(`${baseURL}barangays/update/${id}`, formData, config);
      Alert.alert('Success', 'Barangay updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating barangay:', error);
      Alert.alert('Error', 'Failed to update barangay');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Barangay</Text>
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

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>CONFIRM</Text>
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
