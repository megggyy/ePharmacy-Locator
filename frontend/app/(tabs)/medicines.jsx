import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';
import AuthGlobal from '@/context/AuthGlobal';

export default function MedicationScreen() {
  const { state } = useContext(AuthGlobal);
  const router = useRouter();
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      axios
        .get(`${baseURL}medicine`)
        .then((response) => {
          setMedications(response.data);
          setFilteredMedications(response.data);
        })
        .catch((error) => console.error('Error fetching medications:', error));

      axios
        .get(`${baseURL}medication-category`)
        .then((response) => setCategories(response.data))
        .catch((error) => console.error('Error fetching categories:', error));

      setSelectedCategory(null);
    }, [])
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterMedications(query, selectedCategory);
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setModalVisible(false);
    filterMedications(searchQuery, categoryName);
  };

  const filterMedications = (query, categoryName) => {
    let filtered = medications;

    if (query) {
      filtered = filtered.filter((med) =>
        med.brandName.toLowerCase().includes(query.toLowerCase()) ||
        med.genericName.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (categoryName) {
      filtered = filtered.filter((med) =>
        med.category.some((cat) => cat.name === categoryName)
      );
    }

    setFilteredMedications(filtered);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topSection}>
        {state.isAuthenticated && (
          <View style={styles.header}>
            <Ionicons
              name="menu"
              style={styles.menuIcon}
              onPress={() => router.push('/drawer/UserDrawer')}
            />
            <Ionicons
              name="cloud-upload"
              style={styles.icon}
              onPress={() => router.push('/screens/User/Features/PrescriptionUpload')}
            />
          </View>
        )}

        <TextInput
          style={styles.searchBar}
          placeholder="Search for medicines"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.filterContainer}>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.filterButton}>
            <Text style={styles.filterText}>{selectedCategory || 'Select Category'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.medicationsContainer}>
          {filteredMedications.map((med) => (
            <MedicationCard
              key={med._id}
              name={med.brandName}
              genericName={med.genericName}
              onPress={() => router.push(`/screens/User/Features/MedicationDetails?name=${med.genericName}`)}
            />
          ))}
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <TextInput
                    style={styles.modalSearchBar}
                    placeholder="Search Categories..."
                    value={categorySearchQuery}
                    onChangeText={setCategorySearchQuery}
                  />
                  <ScrollView>
                    {categories
                      .filter((cat) =>
                        cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
                      )
                      .map((cat) => (
                        <TouchableOpacity
                          key={cat._id}
                          onPress={() => handleCategorySelect(cat.name)}
                          style={styles.categoryItem}
                        >
                          <Text>{cat.name}</Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

function MedicationCard({ name, genericName, onPress }) {
  return (
    <TouchableOpacity style={styles.medicationCard} onPress={onPress}>
      <Text style={styles.medicationName}>{name}</Text>
      <Text style={styles.genericName}>{genericName}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#005b7f' },
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filterContainer: {
    margin: 15,
    marginTop: 30,
    marginBottom: 30,
    alignItems: 'center',

  },
  dropdownWrapper: { flex: 1, marginRight: 10 },
  filterButton: {
    flexDirection: 'row',
    backgroundColor: '#005b7f',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  filterText: { color: 'white', fontSize: 17 },
  dropdownMenu: { backgroundColor: '#fff', paddingVertical: 5, paddingHorizontal: 20, borderRadius: 10, marginTop: 5, elevation: 3 },
  dropdownItem: { paddingVertical: 5, color: '#333' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginVertical: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  viewAll: { fontSize: 14, color: '#005b7f' },
  medicationsContainer: { paddingHorizontal: 15, marginBottom: 20, flexDirection: 'column' },
  medicationCard: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 15, elevation: 3, padding: 10 },
  medicationInfo: { flex: 1, justifyContent: 'center' },
  medicationName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  descriptionText: { fontSize: 12, color: '#666', marginTop: 5 },
  topSection: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  menuIcon: { fontSize: 30, color: '#fff' },
  iconsWrapper: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 25, color: '#fff', marginLeft: 10 },
  searchBar: { marginVertical: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
  suggestionsContainer: {
    position: 'absolute',
    backgroundColor: '#005b7f',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 3,
    zIndex: 100,
    marginTop: 5
  },
  suggestionItem: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  suggestionText: { marginLeft: 10, color: 'white' },
  suggestionImage: { width: 40, height: 40, borderRadius: 20 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalSearchBar: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 10,
  },
  categoryList: {
    maxHeight: 300,
    marginBottom: 10,
  },
  categoryItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  viewAllButton: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    marginTop: 10,
  },
  viewAllText: {
    fontSize: 16,
    color: '#007BFF',
  }
});
