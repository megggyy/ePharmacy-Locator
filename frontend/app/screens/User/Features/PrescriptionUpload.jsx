import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';

const PrescriptionUploadScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraPermission.status !== 'granted' || galleryPermission.status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera and gallery permissions are required for this feature.');
      }
    };

    requestPermissions();
  }, []);

  const handleImageUpload = async (uri) => {
    try {
      setIsLoading(true);
  
      const formData = new FormData();
      formData.append('prescriptions', {
        uri,
        name: 'prescription.jpg',
        type: 'image/jpeg',
      });
  
      // Make API request to backend for OCR processing
      const response = await axios.post(`${baseURL}customers/scan-prescription`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      // Get the OCR text and image URL from the response
      const { ocrText, imageUrl } = response.data;
  
      console.log(imageUrl)
      // Update the state with OCR text
      setOcrText(ocrText);
      setImageUrl(imageUrl);
      console.log('ocrText', ocrText)
      console.log('imageurl', imageUrl)
      // Redirect to a new route with image URL and OCR text as query parameters
      router.push({
        pathname: '/screens/User/Features/PrescriptionScan',
        state: { imageUrl, ocrText }, // Passing data using state
      });
      
      
    } catch (error) {
      console.error('Error processing OCR:', error);
      Alert.alert('OCR Error', 'Failed to process the image.');
    } finally {
      setIsLoading(false);
    }
  };
  

  const captureImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      handleImageUpload(uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      handleImageUpload(uri);
    }
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={styles.iconBackground}>
            <Ionicons name="arrow-back" size={24} color="#005b7f" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RX Scanner</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.label}>Scan Prescription</Text>
        <TouchableOpacity style={styles.button} onPress={captureImage}>
          <Ionicons name="camera-outline" size={60} color="white" />
        </TouchableOpacity>
        <Text style={styles.label}>or</Text>
        <Text style={styles.label}>Upload Prescription</Text>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Ionicons name="cloud-upload-outline" size={60} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#005b7f" style={{ marginTop: 20 }} />
      ) : ocrText ? (
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 16, color: '#000' }}>Extracted Text:</Text>
          <Text style={{ fontSize: 14, color: '#555' }}>{ocrText}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 30,
    backgroundColor: '#005b7f',
  },
  backButton: {
    marginRight: 10,
  },
  iconBackground: {
    marginTop: 28,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    marginTop: 28,
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  container: {
    marginTop: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#005b7f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'black',
  },
  label: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default PrescriptionUploadScreen;
