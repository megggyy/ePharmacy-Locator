import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  SafeAreaView,
  Modal,
  TouchableWithoutFeedback
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
  const [suggestions, setSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchBarPosition, setSearchBarPosition] = useState({ width: 0, left: 0 });
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);  // Modal visibility state
  const [categorySearchQuery, setCategorySearchQuery] = useState('');  // Category search query
  const [viewAll, setViewAll] = useState(false); // View all toggle state

  useFocusEffect(
    React.useCallback(() => {
      // Fetch medications
      axios
        .get(`${baseURL}medicine`)
        .then((response) => {
          const uniqueMedications = Array.from(
            new Map(response.data.map((med) => [med.name, med])).values()
          );
          setMedications(uniqueMedications);
          setFilteredMedications(uniqueMedications);
        })
        .catch((error) => {
          console.error('Error fetching medications:', error);
        });

      // Fetch categories
      axios
        .get(`${baseURL}medication-category`)
        .then((response) => {
          setCategories(response.data);
        })
        .catch((error) => {
          console.error('Error fetching categories:', error);
        });

      // Reset selected category when screen is focused
      setSelectedCategory(null);
    }, [])
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterMedications(query, selectedCategory);
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setModalVisible(false);  // Close modal after selecting category
    filterMedications(searchQuery, categoryName);
  };

  const filterMedications = (query, categoryName) => {
    let filtered = medications;

    // If query is empty, show all medications
    if (query) {
      filtered = filtered.filter((medication) => {
        return medication.name.toLowerCase().startsWith(query.toLowerCase()) ||
          medication.description.toLowerCase().startsWith(query.toLowerCase());
      });
    }

    if (categoryName) {
      filtered = filtered.filter(
        (medication) =>
          medication.category &&
          (medication.category.name === categoryName || medication.category === categoryName)
      );
    }

    setFilteredMedications(filtered);
    setSuggestions(query ? filtered.slice(0, 5) : medications.slice(0, 5)); // Show suggestions from all medications if no query
  };


  const handleSuggestionSelect = (medication) => {
    setSearchQuery(medication.name);
    setFilteredMedications([medication]);
    setSuggestions([]);
  };

  const handleCategorySearch = (query) => {
    setCategorySearchQuery(query);
  };

  const handleViewAll = () => {
    setViewAll(!viewAll);  // Toggle between showing all and the filtered list
    setFilteredMedications(viewAll ? medications : filteredMedications);  // Reset to all or filtered list
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
            <View style={styles.iconsWrapper}>
              <Ionicons
                name="cloud-upload"
                style={styles.icon}
                onPress={() => router.push('/screens/User/Features/PrescriptionUpload')}
              />
            </View>
          </View>
        )}

        <TextInput
          style={styles.searchBar}
          placeholder="Search..."
          placeholderTextColor="#AAB4C1"
          value={searchQuery}
          onChangeText={handleSearch}
          onLayout={(event) => {
            const { width, x } = event.nativeEvent.layout;
            setSearchBarPosition({ width, left: x });
          }}
        />

        {suggestions.length > 0 && (
          <View
            style={[
              styles.suggestionsContainer,
              {
                width: searchBarPosition.width,
                left: searchBarPosition.left,
                top: state.isAuthenticated ? 90 : 55,
                maxHeight: 150,
              },
            ]}
          >
            <ScrollView nestedScrollEnabled>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSuggestionSelect(suggestion)}
                  style={styles.suggestionItem}
                >
                  <Text style={styles.suggestionText}>{suggestion.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            onPress={() => setModalVisible(true)} // Open modal when pressed
            style={styles.filterButton}
          >
            <Text style={styles.filterText}>{selectedCategory || 'Select Category'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.medicationsContainer}>
          {filteredMedications.map((medication) => (
            <MedicationCard
              key={medication._id}
              name={medication.name}
              description={medication.description}
              stock={`${medication.stock} in stock`}
              barangay={medication.barangay}
              onPress={() =>
                router.push(`/screens/User/Features/MedicationDetails?name=${medication.name}`)
              }              
            />
          ))}
        </View>
        <View style={styles.sectionHeader}>
          <TouchableOpacity>
            <Text
              style={styles.viewAll}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setFilteredMedications(medications);
                setDropdownOpen(false);
              }}
            >
              View all
            </Text>
          </TouchableOpacity>
        </View>
        {/* Category Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <TextInput
                    style={styles.modalSearchBar}
                    placeholder="Search Categories..."
                    value={categorySearchQuery}
                    onChangeText={handleCategorySearch}
                  />
                  <ScrollView style={styles.categoryList}>
                    {categories
                      .filter((category) =>
                        category.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
                      )
                      .map((category) => (
                        <TouchableOpacity
                          key={category._id}
                          onPress={() => handleCategorySelect(category.name)}
                          style={styles.categoryItem}
                        >
                          <Text style={styles.categoryText}>{category.name}</Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                  <TouchableOpacity title="Close" onPress={() => setModalVisible(false)} />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

function MedicationCard({ name, description, onPress }) {
  return (
    <TouchableOpacity style={styles.medicationCard} onPress={onPress}>
      <View style={styles.medicationInfo}>
        <Text style={styles.medicationName}>{name}</Text>
        <Text style={styles.descriptionText}>{description}</Text>
      </View>
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
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
    marginTop: 10,
  },
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
  },
});

