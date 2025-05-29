import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, TextInput, StatusBar } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../drawer/TopBar';
import baseURL from '@/assets/common/baseurl';
import AuthGlobal from '@/context/AuthGlobal';

const HomeScreen = () => {
  const router = useRouter();
  const { state } = useContext(AuthGlobal);
  const [categories, setCategories] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [medications, setMedications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch data on component mount
  useFocusEffect(
    React.useCallback(() => {
      // Fetch categories
      axios.get(`${baseURL}medication-category`)
        .then(response => setCategories(response.data))
        .catch(error => console.error('Error fetching categories:', error));

      // Fetch pharmacies 
      axios.get(`${baseURL}pharmacies`)
        .then(response => setPharmacies(response.data))
        .catch(error => console.error('Error fetching pharmacies:', error));

      // Fetch medications
      axios.get(`${baseURL}medicine`)
        .then(response => {
          const updatedMedicines = response.data.map((medicine) => ({
            ...medicine,
            categoryNames: medicine.category.map(cat => cat.name).join(' / '),
          }));
          setMedications(updatedMedicines);
        })
        .catch(error => console.error('Error fetching medications:', error));

    }, []) // Empty dependency array to ensure it runs once when the component mounts or refocuses
  );

  // Handle search input change
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Filter categories, pharmacies, and medications based on search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter pharmacies based on search query and approval status
  const filteredPharmacies = pharmacies.filter((pharmacy) =>
    (pharmacy.userInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.userInfo.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.userInfo.city.toLowerCase().includes(searchQuery.toLowerCase())) &&
    pharmacy.approved
  );


  // Helper function to get unique medications by name
  const getUniqueMedications = (medications) => {
    const uniqueNames = new Set();
    return medications.filter((medication) => {
      if (uniqueNames.has(medication.brandName)) {
        return false;
      }
      uniqueNames.add(medication.name);
      return true;
    });
  };

  // Filter medications based on search query and remove duplicates by name
  // const filteredMedications = getUniqueMedications(
  //   medications
  //     .filter((medication) =>
  //       medication.genericName.toLowerCase().includes(searchQuery.toLowerCase())
  //     )
  //     .reduce((acc, med) => {
  //       if (!acc.some((item) => item.genericName === med.genericName)) {
  //         acc.push(med); // Add only if the genericName is not already included
  //       }
  //       return acc;
  //     }, [])
  // );

  const handleCategoryPress = (categoryId, categoryName) => {
    setSelectedCategory(categoryId);
    router.push(`/screens/User/Features/CategoryFilterMedications?id=${categoryId}&name=${categoryName}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#005b7f" barStyle="light-content" />
      {/* Include TopBar component */}
      <View style={styles.topSection}>
        {/* Header with Location and Icons */}
        {state.isAuthenticated && (
          <View style={styles.header}>
            <Ionicons name="menu" style={styles.menuIcon} onPress={() => router.push('/drawer/UserDrawer')} />

            <View style={styles.iconsWrapper}>
              <Ionicons name="cloud-upload" style={styles.icon} onPress={() => router.push('/screens/User/Features/PrescriptionUpload')} />
            </View>
          </View>
        )}
        {/* Search Bar */}
        <TextInput
          style={styles.searchBar}
          placeholder="Search categories, pharmacies, or medications"
          placeholderTextColor="#AAB4C1"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      <ScrollView style={styles.container}>


        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="apps-outline" style={styles.iconStyle} />
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
          {filteredCategories.map((category, index) => {
            const medicalIcons = [
              "medkit-outline", "bandage-outline", "thermometer-outline",
              "flask-outline", "pulse-outline", "eyedrop-outline",
              "heart-outline", "shield-checkmark-outline"
            ];
            const randomIcon = medicalIcons[index % medicalIcons.length];

            return (
              <TouchableOpacity key={category._id} style={styles.categoryCard} onPress={() => handleCategoryPress(category._id, category.name)}>
                <Ionicons name={randomIcon} size={30} color="#005b7f" style={styles.categoryIcon} />
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Pharmacies Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="business-outline" style={styles.iconStyle} />
          <Text style={styles.sectionTitle}>Pharmacies</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pharmaciesContainer}>
          {filteredPharmacies.map((pharmacy) => (
            <TouchableOpacity
              key={pharmacy._id}
              style={styles.pharmacyCard}
              onPress={() => router.push(`/screens/User/Features/PharmacyDetails?id=${pharmacy._id}`)}
            >
              {/* Pharmacy Image */}
              <Image
                style={styles.pharmacyImage}
                source={
                  pharmacy?.images?.[0]
                    ? { uri: pharmacy.images[0] }
                    : require('@/assets/images/sample.jpg')
                }
              />
              {/* Pharmacy Info */}
              <View style={styles.pharmacyInfo}>
                <Text style={styles.pharmacyName}>{pharmacy.userInfo.name}</Text>
                <Text style={styles.pharmacyLocation}>
                  {`${pharmacy.userInfo.street}, ${pharmacy.userInfo.barangay}, ${pharmacy.userInfo.city}`}
                </Text>
                <Text style={styles.pharmacyContact}>{pharmacy.userInfo.contactNumber}</Text>
                <Text style={styles.pharmacyHours}>
                  {`${pharmacy.businessDays} (${pharmacy?.openingHour || 'N/A'} - ${pharmacy?.closingHour || 'N/A'})`}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Medications Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="medkit-outline" style={styles.iconStyle} />
          <Text style={styles.sectionTitle}>Medications</Text>
        </View>

        <View style={styles.medicationsContainer}>
          {medications.map((medication) => (
            <MedicationCard
              key={medication._id}
              brandName={medication.brandName}
              genericName={medication.genericName}
              dosageForm={medication.dosageForm}
              dosageStrength={medication.dosageStrength}
              classification={medication.classification}
              categoryNames={medication.category.map(cat => cat.name).join(' / ')}
              onPress={() => {
                const encodedName = encodeURIComponent(medication.genericName);
                router.push(`/screens/User/Features/MedicationDetails?name=${encodedName}`);
              }}
            />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const MedicationCard = ({ brandName, genericName, dosageForm, dosageStrength, classification, categoryNames, onPress }) => {
  return (
    <TouchableOpacity style={styles.medicationCard} onPress={onPress}>
      <View style={styles.medicineHeader}>
        <Text style={styles.medicineName}>{brandName || 'Unknown'}</Text>
      </View>
      <Text style={styles.genericName}>{genericName || 'Unknown'}</Text>
      <View style={styles.medicineDetails}>
        <Text style={styles.detailText}>💊 Dosage: {dosageStrength || 'N/A'}</Text>
        <Text style={styles.detailText}>📌 Form: {dosageForm || 'N/A'}</Text>
        <Text style={styles.detailText}>📂 Classification: {classification || 'N/A'}</Text>
        <Text style={styles.detailText}>📋 Category: {categoryNames || 'No Category'}</Text>
      </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#005b7f' },
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#fff' },
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  iconStyle: {
    fontSize: 24,
    color: '#005b7f',
    marginRight: 8, // Space between the icon and text
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-start' },
  categoryButton: {
    width: 100, // Fixed width
    height: 40, // Fixed height
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center', // Center the text vertically
  },
  categoryButtonSelected: { backgroundColor: '#005b7f' },
  categoryButtonText: { fontSize: 14, color: '#333' },
  categoryButtonTextSelected: { color: '#fff' },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "nowrap", // Prevents wrapping
    paddingVertical: 10,
    alignItems: "center",
  },
  categoryCard: {
    width: 100, // Set fixed width for uniform size
    height: 100,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10, // Adds space between cards
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },


  categoryIcon: {
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },

  horizontalScroll: {
    flexDirection: 'row',
    paddingVertical: 10,
  },

  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 350, // Controls width for scrolling
    marginRight: 10, // Space between rows
  },
  // Pharmacies Section Styles
  pharmaciesContainer: {
    marginBottom: 15,
    paddingVertical: 10,
  },
  pharmacyCard: {
    width: 250,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginHorizontal: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pharmacyImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
  },
  pharmacyInfo: {
    alignItems: 'flex-start',
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  pharmacyLocation: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  pharmacyContact: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 5,
  },
  pharmacyHours: {
    fontSize: 12,
    color: '#999',
  },


  // Updated Medications Section Styles
  medicationsContainer: { flexDirection: 'column', gap: 10 },
  medicationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  medicineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  medicineName: { fontSize: 18, fontWeight: 'bold', color: '#005b7f' },
  genericName: { fontSize: 16, fontStyle: 'italic', color: '#333', marginBottom: 8 },
  medicineDetails: { marginTop: 6 },
  detailText: { fontSize: 14, color: '#555', marginBottom: 2 },

  pharmacyInfo: { fontSize: 14, color: '#666', marginTop: 5 },
});

export default HomeScreen;