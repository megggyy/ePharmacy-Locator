import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function EditMedicationScreen() {
  const router = useRouter();
  
  const [description, setDescription] = useState('Sample description');
  const [category, setCategory] = useState('Analgesic');
  const [stock, setStock] = useState('100');
  const [image, setImage] = useState(require('@/assets/images/sample.jpg'));

  const handleConfirm = () => {
    console.log('Medication Updated:', { description, category, stock });
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Medication</Text>
      </View>

      <View style={styles.imageSection}>
        <Image source={image} style={styles.medicationImage} />
        <TouchableOpacity style={styles.selectImageButton}>
          <Text style={styles.selectImageText}>Select Image</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Category</Text>
        <Picker
          selectedValue={category}
          style={styles.picker}
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          <Picker.Item label="Analgesic" value="Analgesic" />
          <Picker.Item label="Vitamins" value="Vitamins" />
          <Picker.Item label="Ointment" value="Ointment" />
          <Picker.Item label="Prescription medicine" value="Prescription medicine" />
          <Picker.Item label="Antibacterial" value="Antibacterial" />
          <Picker.Item label="Supplement" value="Supplement" />
        </Picker>

        <Text style={styles.label}>Stock</Text>
        <TextInput
          style={styles.input}
          value={stock}
          onChangeText={setStock}
          keyboardType="numeric"
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
  medicationImage: {
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
  picker: {
    backgroundColor: '#F4F4F4',
    borderRadius: 5,
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
