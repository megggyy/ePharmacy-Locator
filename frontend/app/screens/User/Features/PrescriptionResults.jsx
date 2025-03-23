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
  const [medicines, setMedicines] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedMap, setExpandedMap] = useState(null);

  useEffect(() => {
    try {
      if (matchedMedicines) {
        const parsedMedicines = JSON.parse(matchedMedicines);

        // Group medicines to merge duplicates
        const groupedMedicines = parsedMedicines.reduce((acc, medicine) => {
          if (medicine.matchedFrom === "brandName") {
            // Group by brand name, merge generic names
            if (!acc[medicine.brandName]) {
              acc[medicine.brandName] = {
                brandName: medicine.brandName,
                genericNames: new Set(),
                matchedFrom: "brandName",
              };
            }
            acc[medicine.brandName].genericNames.add(medicine.genericName);
          } else {
            // Group by generic name, merge brand names
            if (!acc[medicine.genericName]) {
              acc[medicine.genericName] = {
                genericName: medicine.genericName,
                brandNames: new Set(),
                matchedFrom: "genericName",
              };
            }
            acc[medicine.genericName].brandNames.add(medicine.brandName);
          }
          return acc;
        }, {});

        // Convert Set to array and store in state
        const optimizedMedicines = Object.values(groupedMedicines).map(med => ({
          ...med,
          genericNames: med.genericNames ? Array.from(med.genericNames) : [],
          brandNames: med.brandNames ? Array.from(med.brandNames) : [],
        }));

        setMedicines(optimizedMedicines);
      }
    } catch (error) {
      console.error("❌ Error parsing matchedMedicines:", error);
      setMedicines([]);
    }
  }, [matchedMedicines]);
  

  useEffect(() => {
    const fetchPharmacies = async () => {
      if (!matchedMedicines) return;

      try {
        setLoading(true);

        const formattedMedicines = JSON.parse(matchedMedicines)
        .map(med => med?.genericName ? med.genericName.trim().toLowerCase() : null)
        .filter(Boolean); // Remove null/undefined values      

        console.log("🔍 Matched Medicines:", formattedMedicines);

        const response = await axios.post(`${baseURL}medicine/with-medicines`, { medicineNames: formattedMedicines });

        console.log("✅ API Response:", response.data);

        setPharmacies(response.data.data || []);
      } catch (err) {
        console.error("❌ API Error:", err.response ? err.response.data : err.message);
        setError("Error fetching pharmacy data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, [matchedMedicines]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pharmacy Results</Text>
      </View>

      {/* Content */}
      {loading ? (
        <Spinner />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {pharmacies.length > 0 ? (
            pharmacies.map((item, index) => {
              const isExpanded = expandedMap === index;

              // Combine same medicine names & sum their stock
              const medicineStockMap = new Map();
           // Extract medicines from `byGeneric` and flatten them into an array
           const allMedicines = Object.values(item.medicines.byGeneric || {}).flat();
           allMedicines.forEach(med => {
             const name = med?.genericName?.trim?.(); // Ensure med and genericName exist
             if (name) {
               medicineStockMap.set(name, (medicineStockMap.get(name) || 0) + (med.stock || 0));
             }
           });

              const uniqueMedicines = Array.from(medicineStockMap, ([genericName, totalStock]) => ({
                genericName,
                totalStock,
              }));

              const allOutOfStock = uniqueMedicines.every(med => med.totalStock === 0);

              return (
                <View key={item.pharmacy._id || index} style={[styles.pharmacyCard, isExpanded && styles.expandedCard]}>
                  
                  {/* Pharmacy Info & Medicines */}
                  <View style={styles.pharmacyInfo}>
                    <Text style={styles.pharmacyName}>{item.pharmacy.name}</Text>
                    <Text style={styles.pharmacyDetails}>
                      {item.pharmacy.address.street}, {item.pharmacy.address.barangay}, {item.pharmacy.address.city}
                    </Text>
                    <Text style={styles.pharmacyDetails}>📞 {item.pharmacy.contactNumber}</Text>
                    <Text style={styles.pharmacyDetails}>
                      🕒 {item.pharmacy.businessDays !== "Not Available" ? item.pharmacy.businessDays : "Business hours not available"}
                    </Text>
                    <Text style={styles.pharmacyDetails}>
                      ⏰ {item.pharmacy.openingHour !== "Not Available" && item.pharmacy.closingHour !== "Not Available"
                        ? `${item.pharmacy.openingHour} - ${item.pharmacy.closingHour}`
                        : "Hours not available"}
                    </Text>
                    <Text style={styles.medicineTitle}>Available Medicines:</Text>
               {/* Display Unique Medicines Without Redundancy */}
               {Object.entries(item.medicines.byGeneric).map(([genericName, brands]) => {
                const scannedMedicine = medicines.find(med => 
                  med.genericName?.toLowerCase() === genericName.toLowerCase() || 
                  brands.some(b => med.brandName?.toLowerCase() === b.brandName?.toLowerCase())
                );

                if (scannedMedicine) {
                  return (
                    <View key={genericName} style={styles.medicineCategory}>
                      {scannedMedicine.matchedFrom === "brandName" ? (
                        // Display brand name with merged generic names
                        <>
                          <Text style={[styles.medicineName, styles.boldText]}>{scannedMedicine.brandName}</Text>
                          <Text style={styles.medicineDetails}>
                            💊 Generic(s): {scannedMedicine.genericNames?.length > 0 ? scannedMedicine.genericNames.join(", ") : "N/A"}
                          </Text>
                        </>
                      ) : (
                        // Display generic name with merged brand names
                        <>
                          <Text style={[styles.medicineName, styles.boldText]}>{scannedMedicine.genericName}</Text>
                          <Text style={styles.medicineDetails}>
                            🏷 Brand(s): {scannedMedicine.brandNames?.length > 0 ? scannedMedicine.brandNames.join(", ") : "N/A"}
                          </Text>
                        </>
                      )}

                      {brands.map((med, index) => (
                        <Text key={index} style={styles.stockText}>{med.stock} in stock</Text>
                      ))}
                    </View>
                  );
                }
              })}

                  </View>
                  {/* Map Section */}
                  <View style={isExpanded ? styles.fullScreenMapContainer : styles.collapsedMapContainer}>
                    <MapView
                      style={isExpanded ? styles.fullScreenMap : styles.collapsedMap}
                      initialRegion={{
                        latitude: parseFloat(item.pharmacy.latitude),
                        longitude: parseFloat(item.pharmacy.longitude),
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                    >
                      <Marker
                        coordinate={{
                          latitude: parseFloat(item.pharmacy.latitude),
                          longitude: parseFloat(item.pharmacy.longitude),
                        }}
                        description={`${item.pharmacy.street}, ${item.pharmacy.barangay}`}
                      />
                    </MapView>

                    <TouchableOpacity
                      style={styles.zoomButton}
                      onPress={() => setExpandedMap(isExpanded ? null : index)}
                    >
                      <Ionicons name={isExpanded ? "remove-circle-outline" : "add-circle-outline"} size={16} color="#007BFF" />
                    </TouchableOpacity>
                  </View>
                  
                    {/* View Pharmacy Button */}
                    <TouchableOpacity
                      style={[styles.viewPharmacyButton, allOutOfStock ? styles.disabledButton : styles.enabledButton]}
                      onPress={() => router.push(`/screens/User/Features/PharmacyDetails?id=${item.pharmacy._id}`)}
                      disabled={allOutOfStock}
                    >
                      <Text style={styles.viewPharmacyButtonText}>View Pharmacy</Text>
                    </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { flexGrow: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#005b7f' },
  backButton: { marginRight: 10 },
  headerTitle: { fontSize: 18, color: 'white', fontWeight: 'bold' },
  pharmacyCard: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 16, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 3 },
  expandedCard: { flexDirection: 'column' },
  pharmacyInfo: { flex: 1, paddingRight: 10 },
  pharmacyName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  pharmacyDetails: { fontSize: 14, color: '#555', marginVertical: 2 },
  medicineTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 8, color: '#333' },
  medicineText: { fontSize: 14, color: '#333', marginLeft: 10 },
  stockText: { fontWeight: 'bold', color: '#007BFF' },
  collapsedMapContainer: { height: 100, marginTop: 10, borderRadius: 10, overflow: 'hidden' },
  collapsedMap: { flex: 1, height: '100%' },
  fullScreenMapContainer: { height: 400, width: '100%', marginTop: 10, borderRadius: 10 },
  fullScreenMap: { flex: 1 },
  zoomButton: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'white', borderRadius: 50, padding: 5, elevation: 5 },
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
  // available medicines
  medicineCategory: { marginTop: 10 },
  medicineGeneric: { fontSize: 14, color: '#333' },
  boldText: { fontWeight: 'bold' },
  medicineBrand: { fontSize: 14, color: '#333', marginLeft: 10 },
  stockText: { fontWeight: 'bold', color: '#007BFF' },

});

export default PrescriptionResultsScreen;
