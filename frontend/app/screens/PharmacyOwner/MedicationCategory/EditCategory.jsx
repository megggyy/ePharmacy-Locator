import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function EditCategory() {
  const router = useRouter();

  // Sample state for editing category details
  const [name, setName] = useState('Pain Relievers');
  const [image, setImage] = useState(require('@/assets/images/sample.jpg')); // Placeholder image

  const handleConfirm = () => {
    console.log('Category Updated');
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Category</Text>
      </View>

      {/* Image Section */}
      <View style={styles.imageSection}>
        <Image source={image} style={styles.categoryImage} />
        <TouchableOpacity style={styles.selectImageButton}>
          <Text style={styles.selectImageText}>Select Image</Text>
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Category Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
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
  categoryImage: {
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
