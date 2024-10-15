import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Icons for the UI
import { useRouter } from 'expo-router';

export default function MedicationScreen() {
  const router = useRouter();
  const [isDropdownOpen1, setDropdownOpen1] = useState(false); // State for Category 1 dropdown
  const [isDropdownOpen2, setDropdownOpen2] = useState(false); // State for Category 2 dropdown

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Section with Header and Search Bar */}
      <View style={styles.topSection}>
        <View style={styles.header}>
          <Ionicons name="menu" style={styles.menuIcon} onPress={() => router.push('../drawer/UserDrawer')} />
          <View style={styles.locationWrapper}>
            <Text style={styles.location}>7A Alley</Text>
            <Text style={styles.location}>Taguig</Text>
          </View>
          <View style={styles.iconsWrapper}>
            <Ionicons name="cloud-upload" style={styles.icon} />
          </View>
        </View>
        <TextInput style={styles.searchBar} placeholder="Search medications..." placeholderTextColor="#AAB4C1" />
      </View>

      <ScrollView style={styles.container}>
        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {/* Category 1 Dropdown */}
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              onPress={() => setDropdownOpen1(!isDropdownOpen1)}
              style={styles.filterButton}
            >
              <Text style={styles.filterText}>Category 1</Text>
              <Ionicons
                name={isDropdownOpen1 ? "chevron-up" : "chevron-down"}
                size={16}
                color="#333"
              />
            </TouchableOpacity>
            {isDropdownOpen1 && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity>
                  <Text style={styles.dropdownItem} onPress={() => router.push('/screens/User/Features/CategoryFilterMedications')} >Pain Relievers</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.dropdownItem} onPress={() => router.push('/screens/User/Features/CategoryFilterMedications')} >Cold & Flu</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.dropdownItem} onPress={() => router.push('/screens/User/Features/CategoryFilterMedications')} >Allergy</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Category 2 Dropdown */}
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              onPress={() => setDropdownOpen2(!isDropdownOpen2)}
              style={styles.filterButton}
            >
              <Text style={styles.filterText}>Category 2</Text>
              <Ionicons
                name={isDropdownOpen2 ? "chevron-up" : "chevron-down"}
                size={16}
                color="#333"
              />
            </TouchableOpacity>
            {isDropdownOpen2 && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity>
                  <Text style={styles.dropdownItem} onPress={() => router.push('/screens/User/Features/CategoryFilterMedications')} >Vitamins</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.dropdownItem} onPress={() => router.push('/screens/User/Features/CategoryFilterMedications')} >Supplements</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.dropdownItem} onPress={() => router.push('/screens/User/Features/CategoryFilterMedications')} >First Aid</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Suggested Medications Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Medications</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll} onPress={() => router.push('../screens/User/Features/ViewAllMedications')}>View all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medicationsContainer}>
          <MedicationCard
            name="Medication 1"
            imageUrl="https://via.placeholder.com/150" // Placeholder image
            description="Pain Reliever"
            stock="20 in stock"
            pharmacy="Pharmacy 1"
            barangay="New Lower Bicutan"
            onPress={() => router.push('/screens/User/Features/MedicationDetails')}
          />
          <MedicationCard
            name="Medication 2"
            imageUrl="https://via.placeholder.com/150" // Placeholder image
            description="Cold & Flu Relief"
            stock="15 in stock"
            pharmacy="Pharmacy 2"
            barangay="Central Signal Village"
            onPress={() => router.push('/screens/User/Features/MedicationDetails')}
          />
        </ScrollView>

        {/* Medications Near Me Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggested Medications</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll} onPress={() => router.push('../screens/User/Features/SuggestedMedicine')}>View all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medicationsContainer}>
          <MedicationCard
            name="Medication 3"
            imageUrl="https://via.placeholder.com/150" // Placeholder image
            description="Vitamin C"
            stock="30 in stock"
            pharmacy="Pharmacy 3"
            barangay="Hagonoy"
            onPress={() => router.push('/screens/User/Features/MedicationDetails')}
          />
          <MedicationCard
            name="Medication 4"
            imageUrl="https://via.placeholder.com/150" // Placeholder image
            description="Allergy Relief"
            stock="10 in stock"
            pharmacy="Pharmacy 4"
            barangay="South Signal Village"
            onPress={() => router.push('/screens/User/Features/MedicationDetails')}
          />
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

function MedicationCard({ name, imageUrl, description, stock, pharmacy, barangay, onPress }) {
  return (
    <TouchableOpacity style={styles.medicationCard} onPress={onPress}>
      <Image source={{ uri: imageUrl }} style={styles.medicationImage} />
      <View style={styles.medicationInfo}>
        <Text style={styles.medicationName}>{name}</Text>
        <Text style={styles.descriptionText}>{description}</Text>
        <Text style={styles.stockText}>{stock}</Text>
        <Text style={styles.pharmacyText}>{pharmacy}</Text>
        <Text style={styles.barangayText}>{barangay}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#005b7f' },
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  menuIcon: { fontSize: 28, color: '#fff' },
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
  iconsWrapper: { flexDirection: 'row' },
  icon: { fontSize: 20, marginHorizontal: 10, color: '#fff'  },
  searchBar: { marginVertical: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },

  /* Filter Section */
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

  dropdownMenu: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 5,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 5,
    color: '#333',
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  viewAll: { fontSize: 14, color: '#005b7f' },

  /* Medications Section */
  medicationsContainer: { paddingHorizontal: 15, marginBottom: 20 },
  medicationCard: {
    flexDirection: 'row', // To place image on the left and info on the right
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 15,
    elevation: 3,
    width: 300, // Adjusted width for more content
    padding: 10,
  },
  medicationImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15, // Space between image and info
  },
  medicationInfo: {
    flex: 1, // Take up remaining space for info
    justifyContent: 'center',
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  descriptionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  stockText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  pharmacyText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  barangayText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});
