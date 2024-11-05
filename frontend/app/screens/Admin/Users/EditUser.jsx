import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For the back icon
import { useRouter } from 'expo-router';

export default function EditUser() {
  const router = useRouter();

  const [name, setName] = useState('Shanai Meg Honrado');
  const [birthdate, setBirthdate] = useState('10-26-2003');
  const [address, setAddress] = useState('dyan lang');

  const handleConfirm = () => {
    // Add functionality for confirming user update
    console.log('User Updated');
    // You might want to navigate back after the update
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Header */}
        <Text style={styles.headerText}>Edit User</Text>
      </View>

      {/* Profile Image Section */}
      <View style={styles.profileImageSection}>
        <Image
          source={require('@/assets/images/sample.jpg')} // Adjust based on image source (require or URI)
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.selectImageButton}>
          <Text style={styles.selectImageText}>Select Image</Text>
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Birthdate</Text>
        <TextInput
          style={styles.input}
          value={birthdate}
          onChangeText={setBirthdate}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
        />
      </View>

      {/* Confirm Button */}
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
    backgroundColor: '#0B607E', // Blue header background, full width
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
  profileImageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
