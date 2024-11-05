import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function EditPharmacyProfile() {
  const router = useRouter();
  const [pharmacyName, setPharmacyName] = useState('Sample Pharmacy');
  const [contactNumber, setContactNumber] = useState('09XXXXXXXXX');
  const [street, setStreet] = useState('123 Main St');
  const [barangay, setBarangay] = useState('Barangay Sample');
  const [city, setCity] = useState('City Sample');
  const [image, setImage] = useState(require('@/assets/images/sample.jpg')); // Placeholder image

  const handleConfirm = () => {
    // Add functionality for confirming profile update
    console.log('Pharmacy Profile Updated');
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Header */}
        <Text style={styles.headerText}>Edit Pharmacy Profile</Text>
      </View>

      {/* Pharmacy Image Section */}
      <View style={styles.imageSection}>
        <Image source={image} style={styles.pharmacyImage} />
        <TouchableOpacity style={styles.selectImageButton}>
          <Text style={styles.selectImageText}>Select Image</Text>
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pharmacy Name</Text>
        <TextInput style={styles.input} value={pharmacyName} onChangeText={setPharmacyName} />

        <Text style={styles.label}>Contact Number</Text>
        <TextInput style={styles.input} value={contactNumber} onChangeText={setContactNumber} />

        <Text style={styles.label}>Street</Text>
        <TextInput style={styles.input} value={street} onChangeText={setStreet} />

        <Text style={styles.label}>Barangay</Text>
        <TextInput style={styles.input} value={barangay} onChangeText={setBarangay} />

        <Text style={styles.label}>City</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} />
      </View>

      <TouchableOpacity style={styles.changePasswordContainer}  onPress={() => router.push('/screens/PharmacyOwner/Profile/ChangePassword')}>
        <Text style={styles.changePasswordText}>Change Password</Text>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </TouchableOpacity>

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
  pharmacyImage: {
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
  changePasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 20, // Padding added to the "Change Password" button
    marginBottom: 30,
  },
  changePasswordText: {
    fontSize: 16,
    color: '#333',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
