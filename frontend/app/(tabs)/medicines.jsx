import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Icons for the UI
import { useRouter } from 'expo-router';
import axios from 'axios'; // Import axios to fetch data
import baseURL from '@/assets/common/baseurl'; // Replace with your base URL
import TopBar from '../drawer/TopBar';

export default function MedicationScreen() {
  const router = useRouter();
  const [medications, setMedications] = useState([]); // State to store medications data
  const [isDropdownOpen1, setDropdownOpen1] = useState(false); // State for Category 1 dropdown
  const [isDropdownOpen2, setDropdownOpen2] = useState(false); // State for Category 2 dropdown

  useEffect(() => {
    // Fetch medications and limit the results to 5
    axios.get(`${baseURL}medicine`) // Adjust the endpoint based on your API
      .then(response => {
        console.log('Medications fetched:', response.data);
        // Limit to 5 medications
        setMedications(response.data.slice(0, 5));
      })
      .catch(error => {
        console.error('Error fetching medications:', error);
      });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Include TopBar component */}
      <TopBar />

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
                  <Text style={styles.dropdownItem} onPress={() => router.push('/screens/User/Features/CategoryFilterMedications')}>Pain Relievers</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.dropdownItem} onPress={() => router.push('/screens/User/Features/CategoryFilterMedications')}>Cold & Flu</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.dropdownItem} onPress={() => router.push('/screens/User/Features/CategoryFilterMedications')}>Allergy</Text>
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
                  <Text style={styles.dropdownItem} onPress={() => router.push('/screens/User/Features/CategoryFilterMedications')}>Vitamins</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.dropdownItem} onPress={() => router.push('/screens/User/Features/CategoryFilterMedications')}>Supplements</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.dropdownItem} onPress={() => router.push('/screens/User/Features/CategoryFilterMedications')}>First Aid</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Medications Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Medications</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll} onPress={() => router.push('../screens/User/Features/ViewAllMedications')}>View all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medicationsContainer}>
          {/* Render fetched medications */}
          {medications.map((medication) => (
            <MedicationCard
              key={medication._id}
              name={medication.name}
              imageUrl={medication.images && medication.images.length > 0 ? medication.images[0] : 'https://via.placeholder.com/150'} // Fallback image if no image available
              description={medication.description}
              stock={`${medication.stock} in stock`}
              barangay={medication.barangay}
              onPress={() => router.push('/screens/User/Features/MedicationDetails')}
            />
          ))}
        </ScrollView>

        {/* Suggested Medications Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggested Medications</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll} onPress={() => router.push('../screens/User/Features/SuggestedMedicine')}>View all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medicationsContainer}>
          {/* Static medications for "Suggested" section */}
          <MedicationCard
            name="Medication 3"
            imageUrl="https://via.placeholder.com/150" // Placeholder image
            description="Vitamin C"
            stock="30 in stock"
            barangay="Hagonoy"
            onPress={() => router.push('/screens/User/Features/MedicationDetails')}
          />
          <MedicationCard
            name="Medication 4"
            imageUrl="https://via.placeholder.com/150" // Placeholder image
            description="Allergy Relief"
            stock="10 in stock"
            barangay="South Signal Village"
            onPress={() => router.push('/screens/User/Features/MedicationDetails')}
          />
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

function MedicationCard({ name, imageUrl, description, stock, barangay, onPress }) {
  return (
    <TouchableOpacity style={styles.medicationCard} onPress={onPress}>
      <Image
        style={styles.medicationImage}
        source={{ uri: imageUrl && imageUrl.length > 0 ? imageUrl : 'https://via.placeholder.com/150' }} // Fallback image if no image available
      />
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
});
