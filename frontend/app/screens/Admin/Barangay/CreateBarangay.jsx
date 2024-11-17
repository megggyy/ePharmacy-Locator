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
  const [description, setDescription] = useState('');
  const [imageUris, setImageUris] = useState([]); // To store selected images

  // Function to pick images
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUris([...imageUris, result.assets[0].uri]); // Add selected image URI
    }
  };

  const handleCreate = async () => {
    const formData = new FormData();
    
    // Append image files
    imageUris.forEach((uri, index) => {
      const filename = uri.split('/').pop();
      const type = `image/${filename.split('.').pop()}`;
      formData.append('images', {
        uri,
        name: filename,
        type,
      });
    });

    // Append other barangay data
    formData.append('name', name);
    formData.append('description', description);

    try {
      // Make POST request to create barangay
      const config = {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      };
      const response = await axios.post(`${baseURL}barangays/create`, formData, config);     
      if (response.data) {
        Alert.alert('Success', 'Barangay created successfully');
        router.back();
      }
    } catch (error) {
      console.error('Error creating barangay:', error);
      Alert.alert('Error', 'Failed to create barangay');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Create Barangay</Text>
      </View>

      {/* Image Section */}
      <View style={styles.imageSection}>
        {imageUris.length > 0 ? (
          imageUris.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.image} />
          ))
        ) : (
          <Image source={require('@/assets/images/sample.jpg')} style={styles.image} />
        )}
        <TouchableOpacity onPress={pickImage} style={styles.selectImageButton}>
          <Text style={styles.selectImageText}>Select Images</Text>
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Barangay Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter barangay name"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
        />
      </View>

      {/* Create Button */}
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
  image: {
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
