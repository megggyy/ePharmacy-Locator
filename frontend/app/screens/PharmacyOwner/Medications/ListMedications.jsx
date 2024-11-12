import React, { useEffect, useState } from 'react'; 
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';

export default function EditMedicationScreen() {
  const router = useRouter();
  const [medications, setMedications] = useState([]);

  // Fetch medications from API
  useFocusEffect(
    React.useCallback(() => {
      const fetchMedications = async () => {
        try {
          const response = await axios.get(`${baseURL}medicine`); // Replace with your actual URL
          setMedications(response.data);
        } catch (error) {
          console.error('Error fetching medications:', error);
        }
      };
  
      fetchMedications();
    }, []) // Empty dependency array to run only once when the component mounts
  );
  

  const handleDelete = (medicationId) => {
    console.log('Delete medication', medicationId);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
    style={styles.row} 
    onPress={() => router.push(`/screens/PharmacyOwner/Medications/ReadMedication?id=${item._id}`)}>
      {/* <Text style={styles.cell}>{item.id}</Text> */}
      <Image source={{ uri: item.images[0] }} style={styles.image} /> 
      <Text style={styles.cell}>{item.description}</Text>
      <Text style={styles.cell}>{item.category.name}</Text>
      <Text style={styles.cell}>{item.stock}</Text>
      <Text style={styles.cell}>{item.pharmacy.userInfo.name}</Text>

      {/* Action Column */}
      <View style={styles.actionCell}>
        <TouchableOpacity onPress={() => router.push(`/screens/PharmacyOwner/Medications/EditMedication?id=${item._id}`)} style={styles.actionButton}>
          <Ionicons name="create-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
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
        <Text style={styles.title}>Medication List</Text>
      </View>
      {/* Create Button */}
      <TouchableOpacity 
            onPress={() => router.push('/screens/PharmacyOwner/Medications/CreateMedication')} 
            style={styles.createButton}
          >
            <Text style={styles.createButtonText}>Create Medicine</Text>
          </TouchableOpacity>
      {/* Medication Table */}
      <Text style={styles.tableTitle}>Medications</Text>
      <View style={styles.tableHeader}>
        {/* <Text style={styles.headerCell}>ID</Text> */}
        <Text style={styles.headerCell}>Image</Text>
        <Text style={styles.headerCell}>Description</Text>
        <Text style={styles.headerCell}>Category</Text>
        <Text style={styles.headerCell}>Stock</Text>
        <Text style={styles.headerCell}>Pharmacy</Text>
        <Text style={styles.headerCell}>Actions</Text>
      </View>
      <FlatList
        data={medications}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
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
  image: {
    width: 50,
    height: 50,
    resizeMode: 'cover',
    borderRadius: 5,
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
  },
  actionButton: {
    marginHorizontal: 5,
  },
});
