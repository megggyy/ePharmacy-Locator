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

  useFocusEffect(
    React.useCallback(() => {
      // Fetch medications
      axios
        .get(`${baseURL}medicine`)
        .then((response) => {
          setMedications(response.data);
          setFilteredMedications(response.data);
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
    }, [])
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === '') {
      setFilteredMedications(medications);
      setSuggestions([]);
    } else {
      const filtered = medications.filter(
        (medication) =>
          medication.name.toLowerCase().includes(query.toLowerCase()) ||
          medication.description.toLowerCase().includes(query.toLowerCase())
      );

      setFilteredMedications(filtered);
      setSuggestions(filtered.slice(0, 5));
    }
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setDropdownOpen(false);

    const filtered = medications.filter(
      (medication) =>
        medication.category &&
        (medication.category.name === categoryName || medication.category === categoryName)
    );

    setFilteredMedications(filtered);
  };

  const handleSuggestionSelect = (medication) => {
    setSearchQuery(medication.name);
    setFilteredMedications([medication]);
    setSuggestions([]);
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
              },
            ]}
          >
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSuggestionSelect(suggestion)}
                style={styles.suggestionItem}
              >
                <Image
                  source={{
                    uri:
                      suggestion.images && suggestion.images[0]
                        ? suggestion.images[0]
                        : 'https://via.placeholder.com/40',
                  }}
                  style={styles.suggestionImage}
                />
                <Text style={styles.suggestionText}>{suggestion.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.filterContainer}>
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              onPress={() => setDropdownOpen(!isDropdownOpen)}
              style={styles.filterButton}
            >
              <Text style={styles.filterText}>
                {selectedCategory || 'Select Category'}
              </Text>
              <Ionicons
                name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#333"
              />
            </TouchableOpacity>
            {isDropdownOpen && (
              <View style={styles.dropdownMenu}>
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleCategorySelect(category.name)}
                  >
                    <Text style={styles.dropdownItem}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Medications</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll} onPress={() => router.push('/screens/User/Features/ViewAllMedications')}>View all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medicationsContainer}>
          {filteredMedications.map((medication) => (
            <MedicationCard
              key={medication._id}
              name={medication.name}
              description={medication.description}
              stock={`${medication.stock} in stock`}
              barangay={medication.barangay}
              onPress={() => router.push(`/screens/User/Features/MedicationDetails?id=${medication._id}`)}
            />
          ))}
        </ScrollView>
        {/* Suggested Medications Section */}
        {/* <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggested Medications</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll} onPress={() => router.push('../screens/User/Features/SuggestedMedicine')}>View all</Text>
          </TouchableOpacity>
        </View> */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medicationsContainer}>
          {/* Static medications for "Suggested" section */}
          {/* <MedicationCard
            name="Medication 3"
            imageUrl="https://via.placeholder.com/150" // Placeholder image
            description="Vitamin C"
            stock="30 in stock"
            barangay="Hagonoy"
            onPress={() => router.push('/screens/User/Features/MedicationDetails')}
          /> */}
          {/* <MedicationCard
            name="Medication 4"
            imageUrl="https://via.placeholder.com/150" // Placeholder image
            description="Allergy Relief"
            stock="10 in stock"
            barangay="South Signal Village"
            onPress={() => router.push('/screens/User/Features/MedicationDetails')}
          /> */}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

function MedicationCard({ name, imageUrl, description, stock, barangay, onPress }) {
  return (
    <TouchableOpacity style={styles.medicationCard} onPress={onPress}>
      <Image style={styles.medicationImage} source={{ uri: imageUrl }} />
      <View style={styles.medicationInfo}>
        <Text style={styles.medicationName}>{name}</Text>
        <Text style={styles.descriptionText}>{description}</Text>
        <Text style={styles.stockText}>{stock}</Text>
        <Text style={styles.barangayText}>{barangay}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#005b7f' },
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filterContainer: { flexDirection: 'row', paddingHorizontal: 15, marginVertical: 10 },
  dropdownWrapper: { flex: 1, marginRight: 10 },
  filterButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 3,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterText: { color: '#333' },
  dropdownMenu: { backgroundColor: '#fff', paddingVertical: 5, paddingHorizontal: 20, borderRadius: 10, marginTop: 5, elevation: 3 },
  dropdownItem: { paddingVertical: 5, color: '#333' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginVertical: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  viewAll: { fontSize: 14, color: '#005b7f' },
  medicationsContainer: { paddingHorizontal: 15, marginBottom: 20 },
  medicationCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, marginRight: 15, elevation: 3, width: 300, padding: 10 },
  medicationImage: { width: 100, height: 100, borderRadius: 10, marginRight: 15 },
  medicationInfo: { flex: 1, justifyContent: 'center' },
  medicationName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  descriptionText: { fontSize: 12, color: '#666', marginTop: 5 },
  stockText: { fontSize: 12, color: '#666', marginTop: 5 },
  barangayText: { fontSize: 12, color: '#666', marginTop: 5 },
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
  locationWrapper: { flex: 1, marginLeft: 10 },
  location: { fontSize: 16, color: '#fff' },
  menuIcon: {
    fontSize: 30,
    color: '#fff',
  },
  icon: { fontSize: 20, marginHorizontal: 10, color: '#fff' },
  searchBar: { marginVertical: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
  suggestionsContainer: {
    position: 'absolute',
    left: 0, // Align to the left of the parent
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    zIndex: 1,
    overflow: 'hidden', // Prevent content overflow
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  suggestionImage: { width: 40, height: 40, borderRadius: 5, marginRight: 10 },
  suggestionText: { fontSize: 14, color: '#333' },
});
