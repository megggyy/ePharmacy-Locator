import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TouchableWithoutFeedback, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';
import Spinner from "@/assets/common/spinner";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function ReadPharmacyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchPharmacy = async () => {
        try {
          const response = await axios.get(`${baseURL}pharmacies/${id}`);
          setPharmacy(response.data);
        } catch (err) {
          console.error('Error fetching pharmacy details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchPharmacy();
    }
  }, [id]);

  const handleApprove = async (id) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json"
        }
      };
      await axios.put(`${baseURL}pharmacies/approved/${id}`, config);
      Alert.alert('Success', 'PHARMACY IS APPROVED');
      router.push('/screens/Admin/Pharmacies/ListPharmacies');
    } catch (error) {
      console.error('Error updating medication:', error);
      Alert.alert('Error', 'Failed to approve pharmacy');
    }
  };

  const handleImagePress = (image) => {
    setSelectedImage(image);
    setIsModalVisible(true);
  };

  const closeImageModal = () => {
    setIsModalVisible(false);
    setSelectedImage(null);
  };

  if (loading) {
    return <Spinner />;
  }

  if (!pharmacy) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorMessage}>Pharmacy not found!</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{pharmacy.userInfo.name}</Text>
      </View>

      <View style={styles.detailsContainer}>
        {/* Pharmacy Images Section */}
        <Text style={styles.sectionTitle}>Pharmacy Images</Text>
        <FlatList
          data={pharmacy.images}
          horizontal={true}
          pagingEnabled={true}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleImagePress(item)}>
              <Image source={{ uri: item }} style={styles.image} />
            </TouchableOpacity>
          )}
          keyExtractor={(image, index) => index.toString()}
        />

        {/* Pharmacy Permits Section */}
        <Text style={styles.sectionTitle}>Pharmacy Permits</Text>
        <FlatList
          data={pharmacy.permits}
          horizontal={true}
          pagingEnabled={true}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleImagePress(item)}>
              <Image source={{ uri: item }} style={styles.image} />
            </TouchableOpacity>
          )}
          keyExtractor={(permit, index) => index.toString()}
        />

        {/* Modal for Expanded Image */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          onRequestClose={closeImageModal}
          animationType="fade"
        >
          <TouchableWithoutFeedback onPress={closeImageModal}>
            <View style={styles.modalBackground}>
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.modalImage}
                />
              ) : (
                <ActivityIndicator size="large" color="#fff" />
              )}
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Pharmacy Details */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={pharmacy.userInfo.email} editable={false} />

          <Text style={styles.label}>Contact Number</Text>
          <TextInput style={styles.input} value={pharmacy.userInfo.contactNumber || 'N/A'} editable={false} />

          <Text style={styles.label}>Address</Text>
          <TextInput style={styles.input} value={`${pharmacy.userInfo.street}, ${pharmacy.userInfo.barangay}, ${pharmacy.userInfo.city}`} editable={false} />

          {/* New Fields - Business Days, Opening Hours, Closing Hours */}
          <Text style={styles.label}>Business Days</Text>
          <TextInput style={styles.input} value={pharmacy.businessDays || 'N/A'} editable={false} />

          <Text style={styles.label}>Operating Hours</Text>
          <TextInput
            style={styles.input}
            value={`${pharmacy.openingHour || 'N/A'} - ${pharmacy.closingHour || 'N/A'}`}
            editable={false}
          />

          <TouchableOpacity
            style={[styles.confirmButton, pharmacy.approved && styles.disabledButton]} // Apply disabled style
            onPress={() => handleApprove(pharmacy._id)}
            disabled={pharmacy.approved} // Disable if approved
          >
            <Text style={[styles.confirmButtonText, pharmacy.approved && styles.disabledText]}>
              {pharmacy.approved ? 'Approved' : 'Approve Pharmacy'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    backgroundColor: '#005b7f',
    paddingTop: 60,
    paddingBottom: 15,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  backButton: {
    position: 'absolute',
    top: 59,
    left: 20,
  },
  detailsContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  image: {
    width: 200, // Adjusted size for smaller images
    height: 200,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  modalImage: {
    width: 375,
    height: 500,
    borderRadius: 10,
    marginHorizontal: 5,
    marginBottom: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    marginTop: 20
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F2F2F2',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#005b7f',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#BEBEBE',
  },
  disabledText: {
    color: '#8F8F8F',
  },
  errorMessage: {
    textAlign: 'center',
    fontSize: 20,
    marginTop: 50,
  },
});
