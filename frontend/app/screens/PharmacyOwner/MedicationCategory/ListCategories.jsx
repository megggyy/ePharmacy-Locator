import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';

export default function MedicationCategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  // Fetch categories when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchCategories = async () => {
        try {
          const response = await axios.get(`${baseURL}medication-category`);
          setCategories(response.data);
        } catch (error) {
          console.error('Error fetching categories:', error);
          Alert.alert('Error', 'Failed to load categories');
        }
      };
      fetchCategories();
    }, [])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.row} 
      onPress={() => router.push(`/screens/PharmacyOwner/MedicationCategory/ReadCategory?id=${item._id}`)}
    >    
      {/* Render Images */}
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

      {/* Display Category Name and Description */}
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.description}</Text>

      {/* Actions */}
      {/* <View style={styles.actionCell}>
        <TouchableOpacity onPress={() => router.push(`/screens/PharmacyOwner/MedicationCategory/EditCategory/${item._id}`)} style={styles.actionButton}>
          <Ionicons name="create-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View> */}
       <View style={styles.actionCell}>
        <TouchableOpacity 
          onPress={() => router.push(`/screens/PharmacyOwner/MedicationCategory/EditCategory?id=${item._id}`)} 
          style={styles.actionButton}
        >
          <Ionicons name="create-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const handleDelete = async (categoryId) => {
    try {
      await axios.delete(`${baseURL}medication-category/delete/${categoryId}`);
      setCategories(categories.filter(category => category._id !== categoryId));
      Alert.alert('Success', 'Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      Alert.alert('Error', 'Failed to delete category');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Medication Categories</Text>
      </View>

      {/* Create Button */}
      <TouchableOpacity 
        onPress={() => router.push('/screens/PharmacyOwner/MedicationCategory/CreateCategory')} 
        style={styles.createButton}
      >
        <Text style={styles.createButtonText}>Create Category</Text>
      </TouchableOpacity>

      {/* Categories Table */}
      <Text style={styles.tableTitle}>Categories</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>Image</Text>
        <Text style={styles.headerCell}>Category</Text>
        <Text style={styles.headerCell}>Description</Text>
        <Text style={styles.headerCell}>Actions</Text>
      </View>
      <FlatList
        data={categories}
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
});
