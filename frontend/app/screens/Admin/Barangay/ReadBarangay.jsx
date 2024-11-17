import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';

export default function ReadBarangayScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [barangayData, setBarangayData] = useState(null);

  useEffect(() => {
    const fetchBarangay = async () => {
      try {
        const response = await axios.get(`${baseURL}barangays/${id}`);
        setBarangayData(response.data);
      } catch (error) {
        console.error('Error fetching barangay:', error);
        Alert.alert('Error', 'Failed to load barangay details');
      }
    };
    if (id) fetchBarangay();
  }, [id]);

  if (!barangayData) {
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
        <Text style={styles.title}>Barangay Details</Text>
      </View>

      {/* Barangay Details */}
      <View style={styles.detailsContainer}>
        <FlatList
          data={barangayData.images}
          horizontal
          renderItem={({ item: image }) => (
            <Image source={{ uri: image }} style={styles.image} />
          )}
          keyExtractor={(image, index) => index.toString()}
        />
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{barangayData.name}</Text>
        <Text style={styles.label}>Description:</Text>
        <Text style={styles.value}>{barangayData.description}</Text>
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
    backgroundColor: '#0B607E',
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginHorizontal: 5,
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
