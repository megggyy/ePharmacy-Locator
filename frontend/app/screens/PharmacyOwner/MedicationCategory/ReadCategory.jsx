import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ReadCategoryScreen() {
  const router = useRouter();

  // Sample category data
  const categoryData = {
    name: 'Pain Relievers',
    description: 'Medications that help relieve pain, including over-the-counter and prescription options.',
    image: require('@/assets/images/sample.jpg'), // Replace with actual image path or a placeholder
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Category Details</Text>
      </View>

      {/* Category Details */}
      <View style={styles.detailsContainer}>
        <Image source={categoryData.image} style={styles.image} />
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{categoryData.name}</Text>
        <Text style={styles.label}>Description:</Text>
        <Text style={styles.value}>{categoryData.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 0,
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
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});
