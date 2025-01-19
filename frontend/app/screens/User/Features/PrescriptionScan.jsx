import React, { useEffect, useState  } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const PrescriptionScreen = () => {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(null);
  const [ocrText, setOcrText] = useState(null);

  useEffect(() => {
    if (router?.state) {
      const { imageUrl, ocrText } = router.state;
      setImageUrl(imageUrl);
      setOcrText(ocrText);
      console.log("OCR Text:", ocrText);
      console.log("Image URL:", imageUrl);
    } else {
      Alert.alert('No data found', 'Please upload an image first.');
    }
  }, [router?.state]); // Re-run when state is available


  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={styles.iconBackground}>
            <Ionicons name="arrow-back" size={24} color="#005b7f" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Uploaded Prescription</Text>
      </View>

      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.prescriptionImage}
            resizeMode="contain"
          />
        ) : (
          <Text>No image to display</Text> // Placeholder text if no image URI is provided
        )}
      </View>

      <View style={styles.ocrTextContainer}>
        {ocrText ? (
          <Text style={styles.ocrText}>{ocrText}</Text> // Display OCR text if available
        ) : (
          <Text>No OCR text found</Text> // Placeholder if OCR text is not available
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.scanButton} onPress={() => router.push('/screens/User/Features/PrescriptionResults')}>
          <Text style={styles.scanButtonText}>Scan Now</Text>
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
    backgroundColor: '#005b7f', // Dark blue header background
  },
  backButton: {
    marginRight: 10,
  },
  iconBackground: {
    marginTop: 28,
    backgroundColor: 'white', // White background for arrow visibility
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    marginTop: 28,
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  prescriptionImage: {
    width: '100%',
    height: 500, // Adjust based on your image's size
  },
  ocrTextContainer: {
    padding: 20,
    marginTop: 20,
  },
  ocrText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  scanButton: {
    width: 200,
    height: 50,
    backgroundColor: '#005b7f', // Dark blue for the button
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black', // Optional border for the button
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PrescriptionScreen;
