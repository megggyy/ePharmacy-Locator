import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MedicationCategoriesScreen() {
  const router = useRouter();

  // Sample data
  const categories = [
    { id: 1, name: 'Pain Relievers', image: require('@/assets/images/sample.jpg') },
    { id: 2, name: 'Antibiotics', image: require('@/assets/images/sample.jpg') },
    { id: 3, name: 'Vitamins', image: require('@/assets/images/sample.jpg') },
    { id: 4, name: 'Cough and Cold', image: require('@/assets/images/sample.jpg') },
    { id: 5, name: 'Antacids', image: require('@/assets/images/sample.jpg') },
  ];

//   const handleEdit = (categoryId) => {
//     console.log('Edit category', categoryId);
//     router.push(`/screens/Admin/Categories/EditCategory/${categoryId}`);
//   };

//   const handleDelete = (categoryId) => {
//     console.log('Delete category', categoryId);
//     // Implement deletion logic here
//   };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.row} onPress={() => router.push('/screens/PharmacyOwner/MedicationCategory/ReadCategory')}>
      <Text style={styles.cell}>{item.id}</Text>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.cell}>{item.name}</Text>
      <View style={styles.actionCell}>
        <TouchableOpacity onPress={() => router.push('/screens/PharmacyOwner/MedicationCategory/EditCategory')} style={styles.actionButton}>
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
        <Text style={styles.title}>Medication Categories</Text>
      </View>

      {/* Categories Table */}
      <Text style={styles.tableTitle}>Categories</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>ID</Text>
        <Text style={styles.headerCell}>Image</Text>
        <Text style={styles.headerCell}>Category</Text>
        <Text style={styles.headerCell}>Actions</Text>
      </View>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
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
