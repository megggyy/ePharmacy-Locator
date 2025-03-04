import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import baseURL from '@/assets/common/baseurl';
import axios from 'axios';
import Spinner from "../../../../assets/common/spinner"; // Import Spinner

const PrescriptionResultsScreen = () => {
  const router = useRouter();
  const { matchedMedicines } = useLocalSearchParams();
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedMap, setExpandedMap] = useState(null);

  useEffect(() => {
    const fetchPharmacies = async () => {
      if (!matchedMedicines) return;

      try {
        setLoading(true);
        const formattedMedicines = JSON.parse(matchedMedicines).map(med => med.trim().toLowerCase());

        console.log("Fetching pharmacies with medicines:", formattedMedicines);

        const response = await axios.post(`${baseURL}medicine/with-medicines`, { medicineNames: formattedMedicines });
        console.log("API Response:", response.data);

        setPharmacies(response.data.data || []);
      } catch (err) {
        console.error("API Error:", err);
        setError("Error fetching pharmacy data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, [matchedMedicines]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pharmacy Results</Text>
      </View>
  
      {loading ? (   
     <Spinner />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {pharmacies.length > 0 ? (
            pharmacies.map((item, index) => {
              const isExpanded = expandedMap === index;
              return (
              <View key={item.pharmacy._id || index} style={[styles.pharmacyCard, isExpanded && styles.expandedCard]}>
                <View style={styles.pharmacyInfo}>
                  <Text style={styles.pharmacyName}>{item.pharmacy.userInfo.name}</Text>
                  <Text style={styles.pharmacyDetails}>{item.pharmacy.userInfo.street}, {item.pharmacy.userInfo.barangay}, {item.pharmacy.userInfo.city}</Text>
                  <Text style={styles.pharmacyDetails}>📞 {item.pharmacy.userInfo.contactNumber}</Text>
                  <Text style={styles.pharmacyDetails}>🕒 {item.pharmacy.businessDays} ({item.pharmacy.openingHour} - {item.pharmacy.closingHour})</Text>
                  <Text style={styles.medicineTitle}>Available Medicines:</Text>
                  {item.medicines.map((med, medIndex) => (
                    <Text key={`${item.pharmacy._id}-${medIndex}`} style={styles.medicineText}>
                      {med.genericName}: {med.stock} in stock
                    </Text>
                  ))}
                  
                  {/* View Pharmacy Button */}
                  <TouchableOpacity
                    style={styles.viewPharmacyButton}
                    onPress={() => router.push(`/screens/User/Features/PharmacyDetails?id=${item.pharmacy._id}`)}
                  >
                    <Text style={styles.viewPharmacyButtonText}>View Pharmacy</Text>
                  </TouchableOpacity>
                </View>

                <View style={isExpanded ? styles.fullScreenMapContainer : styles.mapContainer}>
                  <MapView
                    style={isExpanded ? styles.fullScreenMap : styles.map}
                    initialRegion={{
                      latitude: parseFloat(item.pharmacy.location.latitude),
                      longitude: parseFloat(item.pharmacy.location.longitude),
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: parseFloat(item.pharmacy.location.latitude),
                        longitude: parseFloat(item.pharmacy.location.longitude),
                      }}
                      title={item.pharmacy.userInfo.name}
                      description={`${item.pharmacy.userInfo.street}, ${item.pharmacy.userInfo.barangay}`}
                    />
                  </MapView>

                  <TouchableOpacity
                    style={styles.zoomButton}
                    onPress={() => setExpandedMap(isExpanded ? null : index)}
                  >
                    <Ionicons name={isExpanded ? "remove-circle-outline" : "add-circle-outline"} size={16} color="#007BFF" />
                  </TouchableOpacity>
                </View>
              </View>
              );
            })
          ) : (
            <Text style={styles.noResults}>No pharmacies found with the requested medications.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  content: { 
    flexGrow: 1, 
    padding: 16 
  },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#005b7f' },
  backButton: { marginRight: 10 },
  headerTitle: { fontSize: 18, color: 'white', fontWeight: 'bold' }, 
  loadingText: { marginTop: 10, fontSize: 16, color: '#005b7f' },
  pharmacyCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  expandedCard: {
    flexDirection: 'column',
  },
  pharmacyInfo: {
    flex: 1,
    paddingRight: 10,
  },
  pharmacyName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  pharmacyDetails: { fontSize: 14, color: '#555', marginVertical: 2 },
  medicineTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 8, color: '#333' },
  medicineText: { fontSize: 14, color: '#333', marginLeft: 10 },
  mapContainer: {
    flex: 1,
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
    height: 150,
  },
  fullScreenMapContainer: {
    flex: 1,
    height: 400,
    width: '100%',
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  fullScreenMap: {
    flex: 1,
    height: '100%',
  },
  zoomButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 5,
    elevation: 5,
  },
  noResults: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#888' },
  viewPharmacyButton: {
    marginTop: 10,
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  viewPharmacyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },  
});

export default PrescriptionResultsScreen;
