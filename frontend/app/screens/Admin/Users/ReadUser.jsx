import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TouchableWithoutFeedback, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';
import Spinner from "@/assets/common/spinner";

export default function ReadUserScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`${baseURL}users/${id}`);
          setUser(response.data);
        } catch (err) {
          console.error('Error fetching user details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id]);

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

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorMessage}>User not found!</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{user.name.toUpperCase()}</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.detailsContainer}>
          {/* Image Carousel */}
          <FlatList
            data={user.customerDetails?.images}
            horizontal
            pagingEnabled
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleImagePress(item)}>
                <Image source={{ uri: item }} style={styles.image} />
              </TouchableOpacity>
            )}
            keyExtractor={(image, index) => index.toString()}
          />

          {/* Modal for Expanded Image */}
          <Modal
            visible={isModalVisible}
            transparent
            onRequestClose={closeImageModal}
            animationType="fade"
          >
            <TouchableWithoutFeedback onPress={closeImageModal}>
              <View style={styles.modalBackground}>
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={styles.modalImage} />
                ) : (
                  <ActivityIndicator size="large" color="#fff" />
                )}
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* User Details */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={user.email} editable={false} />

            <Text style={styles.label}>Mobile Number</Text>
            <TextInput style={styles.input} value={user.contactNumber} editable={false} />

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={`${user.street}, ${user.barangay}, ${user.city}` || 'N/A'}
              editable={false}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    backgroundColor: '#005b7f',
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  detailsContainer: {
    margin: 20,
  },
  image: {
    width: 350,
    height: 350,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  modalImage: {
    width: 400,
    height: 400,
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
    marginTop: 20,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F4F4F4',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  errorMessage: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
