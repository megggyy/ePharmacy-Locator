import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const GOOGLE_VISION_API_KEY = 'AIzaSyAeSLdfKJ-yJQf7NliKF84aWjxIQzo7NPA'; // Replace with your actual API key

const PrescriptionUploadScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const router = useRouter();

  // Request permissions for Camera and Gallery
  useEffect(() => {
    const requestPermissions = async () => {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraPermission.status !== 'granted' || galleryPermission.status !== 'granted') {
        Alert.alert('Permission Denied', 'CAMERA AND GALLERY PERMISSIONS ARE REQUIRED FOR THIS FEATURE');
      }
    };

    requestPermissions();
  }, []);

  // Function to capture an image using the camera
  const captureImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri; // Access the image URI here
      setImageUri(uri);
      processImage(uri);
      console.log(uri);
      // Redirect to another screen after image capture
      router.push({
        pathname: '/screens/User/Features/PrescriptionScan',
        params: { imageUri: uri }, // Pass imageUri as a parameter
      });
    }
  };

  // Function to pick an image from the gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri; // Access the image URI here
      setImageUri(uri);
      processImage(uri);
      // Redirect to another screen after image selection
      router.push({
        pathname: '/screens/User/Features/PrescriptionScan',
        params: { imageUri: uri }, // Pass imageUri as a parameter
      });
    }
  };

  // Function to process image using Google Vision API
  const processImage = async (uri) => {
    const imageBase64 = await uriToBase64(uri);
  
    try {
      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        {
          requests: [
            {
              image: {
                content: imageBase64,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                },
              ],
            },
          ],
        }
      );
  
      console.log(response.data); // Check the full response for debugging
  
      const detectedText =
        response.data.responses[0]?.textAnnotations[0]?.description || '';
      setOcrText(detectedText);
    } catch (error) {
      console.error('Error during OCR:', error);
      if (error.response) {
        // Log detailed error response if available
        console.error('API error response:', error.response.data);
        Alert.alert('OCR Error', `Failed to extract text from the image: ${error.response.data.error.message}`);
      } else {
        Alert.alert('OCR Error', 'An unknown error occurred while processing the image.');
      }
    }
  };
  

  // Function to convert image URI to Base64
  const uriToBase64 = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return await blobToBase64(blob);
  };

  // Function to convert Blob to Base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <View style={styles.safeArea}>
      {/* Header with back button and title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={styles.iconBackground}>
            <Ionicons name="arrow-back" size={24} color="#005b7f" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RX scanner</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.container}>
        <Text style={styles.label}>Scan Prescription</Text>
        {/* Camera Button */}
        <TouchableOpacity style={styles.button} onPress={captureImage}>
          <Ionicons name="camera-outline" size={60} color="white" />
        </TouchableOpacity>
        <Text style={styles.label}>or</Text>
        <Text style={styles.label}>Upload Prescription</Text>

        {/* Upload Button */}
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Ionicons name="cloud-upload-outline" size={60} color="white" />
        </TouchableOpacity>
      </View>
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
