import React, { useState, useCallback } from 'react';
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';

export default function CreateCategory() {
  const router = useRouter();

  // State for new category details
  const [name, setName] = useState('');
  const [token, setToken] = useState();
  const [categoriesList, setCategoriesList] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useFocusEffect(
    useCallback(() => {
      axios
        .get(`${baseURL}medication-category`)
        .then((res) => {
          setCategoriesList(res.data);
          setFilteredCategories(res.data);
          setLoading(false);
        })
        .catch((err) => console.error(err));

      return () => {
        setCategoriesList([]);
        setFilteredCategories([]);
        setLoading(true);
      };
    }, [])
  );

  const handleCreate = async () => {
    const formData = new FormData();
    formData.append('name', name);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      };
      const response = await axios.post(`${baseURL}medication-category/create`, formData, config);
      if (response.data) {
        Alert.alert('Success', 'Category created successfully');
        router.push('/screens/Admin/MedicationCategory/ListCategories');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Error', 'Failed to create category');
    }
  };

  // Handle text input change and filter category list
  const handleInputChange = (text) => {
    setName(text);
    if (text.trim() === '') {
      setFilteredCategories([]);
    } else {
      const filtered = categoriesList.filter(category =>
        category.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  };

  // Handle selecting a category from suggestions
  const handleSelectCategory = (categoryName) => {
    setName(categoryName);
    setFilteredCategories([]); // Hide suggestions after selection
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Create Category</Text>
      </View>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Category Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={handleInputChange}
          placeholder="Enter category name"
        />

        {/* Category suggestions dropdown */}
        {filteredCategories.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={filteredCategories}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleSelectCategory(item.name)}
                >
                  <Text style={styles.suggestionText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
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
    backgroundColor: '#005b7f',
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
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
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
    marginBottom: 5,
    textAlign: 'justify',
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  suggestionText: {
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#005b7f',
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
