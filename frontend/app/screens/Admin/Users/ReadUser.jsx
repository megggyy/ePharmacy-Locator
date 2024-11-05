import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ReadUserScreen() {
  const router = useRouter();

  // Sample user data
  const userData = {
    name: 'Abodisi Killa',
    birthdate: '1990-01-30',
    address: 'Taguig City',
    image: require('@/assets/images/sample.jpg'), // Replace with actual image path or a placeholder image
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>User Details</Text>
      </View>

      {/* User Details */}
      <View style={styles.detailsContainer}>
        <Image source={userData.image} style={styles.image} />
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{userData.name}</Text>
        <Text style={styles.label}>Birthdate:</Text>
        <Text style={styles.value}>{userData.birthdate}</Text>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>{userData.address}</Text>
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
  },
});
