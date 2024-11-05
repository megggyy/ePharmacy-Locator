import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ReadMedicationScreen() {
  const router = useRouter();

  // Sample medication data
  const medicationData = {
    id: 1,
    image: require('@/assets/images/sample.jpg'), // Replace with the actual image path
    description: 'A pain reliever that helps reduce fever and inflammation.',
    category: 'Analgesic',
    stock: 100,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Medication Details</Text>
      </View>

      {/* Medication Details */}
      <View style={styles.detailsContainer}>
        <Image source={medicationData.image} style={styles.image} />
        <Text style={styles.label}>Description:</Text>
        <Text style={styles.value}>{medicationData.description}</Text>
        <Text style={styles.label}>Category:</Text>
        <Text style={styles.value}>{medicationData.category}</Text>
        <Text style={styles.label}>Stock:</Text>
        <Text style={styles.value}>{medicationData.stock}</Text>
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
  },
});
