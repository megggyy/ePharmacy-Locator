import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';

export default function ListBarangayScreen() {
  const router = useRouter();
  const [barangays, setBarangays] = useState([]);

  // Fetch barangays from API
  useFocusEffect(
    React.useCallback(() => {
      const fetchBarangays = async () => {
        try {
          const response = await axios.get(`${baseURL}barangays`);
          setBarangays(response.data);
        } catch (error) {
          console.error('Error fetching barangays:', error);
          Alert.alert('Error', 'Failed to load barangays');
        }
      };
      fetchBarangays();
    }, [])
  );

  const handleDelete = async (barangayId) => {
    try {
      await axios.delete(`${baseURL}barangays/delete/${barangayId}`);
      setBarangays(barangays.filter(barangay => barangay._id !== barangayId));
      Alert.alert('Success', 'Barangay deleted successfully');
    } catch (error) {
      console.error('Error deleting barangay:', error);
      Alert.alert('Error', 'Failed to delete barangay');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/screens/Admin/Barangay/ReadBarangay?id=${item._id}`)}
    >
      {/* Barangay Images */}
      <View style={styles.imageContainer}>
        <FlatList
          data={item.images}
          horizontal
          renderItem={({ item: image }) => (
            <Image source={{ uri: image }} style={styles.image} />
          )}
          keyExtractor={(image, index) => index.toString()}
        />
      </View>

      {/* Name and Description */}
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.description}</Text>

      {/* Actions */}
      <View style={styles.actionCell}>
        <TouchableOpacity
          onPress={() => router.push(`/screens/Admin/Barangay/EditBarangay?id=${item._id}`)}
          style={styles.actionButton}
        >
          <Ionicons name="create-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item._id)}
          style={styles.actionButton}
        >
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Image source={require('@/assets/images/epharmacy-logo.png')} style={styles.logo} />
        <Text style={styles.title}>ePharmacy</Text>
      </View>

      {/* Create Button */}
      <TouchableOpacity
        onPress={() => router.push('/screens/Admin/Barangay/CreateBarangay')}
        style={styles.createButton}
      >
        <Text style={styles.createButtonText}>Add Barangay</Text>
      </TouchableOpacity>

      {/* Table Header */}
      <Text style={styles.tableTitle}>Barangays</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>Image</Text>
        <Text style={styles.headerCell}>Name</Text>
        <Text style={styles.headerCell}>Description</Text>
        <Text style={styles.headerCell}>Actions</Text>
      </View>

      {/* Barangays List */}
      <FlatList
        data={barangays}
        renderItem={renderItem}
        keyExtractor={(item) => item._id.toString()}
        style={styles.table}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#0B607E',
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  createButton: {
    backgroundColor: '#0B607E',
    paddingVertical: 10,
    marginHorizontal: 100,
    marginBottom: 20,
    marginTop: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tableTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EEEEEE',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  table: {
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    color: '#333333',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 40,
    height: 40,
    resizeMode: 'cover',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
  },
  actionButton: {
    marginHorizontal: 5,
  },
  logo: {
    width: 60,
    height: 60,
  },
});
