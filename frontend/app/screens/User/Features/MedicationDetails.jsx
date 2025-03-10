import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';

const MedicationDetails = () => {
  const router = useRouter();
  const { name } = useLocalSearchParams();
  const decodedName = name ? decodeURIComponent(name) : "";
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log(name)
  useEffect(() => {
    if (decodedName) {
      const fetchData = () => {
        console.log("Fetching for name:", decodedName); // Debugging

        axios
          .get(`${baseURL}medicine/available/${decodedName}`)
          .then((response) => {
            console.log("API Response:", response.data); // Debugging
            setMedications(response.data.data);
            setLoading(false);
          })
          .catch((error) => {
            // console.error("Error fetching data:", error);
            setLoading(false);
          });
      };

      fetchData();
      const interval = setInterval(fetchData, 5000);

      return () => clearInterval(interval);
    }
  }, [decodedName]);

  const formatDateTime = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'long' });
    const year = String(date.getFullYear());
    return `${month} ${day}, ${year}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B607E" />
      </View>
    );
  }

  if (!medications || medications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No pharmacy available.</Text>
      </View>
    );
  }

  const medicationName = medications[0]?.medicine?.genericName;

  return (
    <View style={styles.safeArea}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{medicationName}</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContent}>

        <View style={styles.pharmacyContainer}>
          <Text style={styles.pharmacyTitle}>AVAILABLE PHARMACIES</Text>
        </View>

        {medications.map((medication, index) => {
          const medicine = medication.medicine || {};
          const pharmacy = medication.pharmacy || {};
          const userInfo = pharmacy.userInfo || {};
          const location = pharmacy.location || {};

          // Calculate stock for each pharmacy individually
          const pharmacyStock = medication.expirationPerStock?.reduce((sum, stockItem) => {
            const stockValue = Number(stockItem.stock);
            return !isNaN(stockValue) ? sum + stockValue : sum;
          }, 0) || 0;

          return (
            <View key={index} style={styles.infoContainer}>
              <TouchableOpacity
                onPress={() => {
                  if (pharmacyStock > 0) {
                    const encodedName = encodeURIComponent(medicine.genericName);
                    router.push(`/screens/User/Features/MedicineList?pharmacyId=${pharmacy._id}&genericName=${encodedName}`);
                  }
                }}
                disabled={pharmacyStock === 0}
                style={{ opacity: pharmacyStock === 0 ? 0.5 : 1 }}
              >
                <Text style={styles.pharmacyName}>{userInfo.name || 'Unknown Pharmacy'}</Text>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={18} color="#555" />
                  <Text style={styles.infoText}>
                    {`${userInfo.street || ''}, ${userInfo.barangay || ''}, ${userInfo.city || ''}`
                      .replace(/(, )+/g, ', ')
                      .trim()}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={18} color="#555" />
                  <Text
                    style={styles.infoText}
                    onPress={() => Linking.openURL(`tel:${userInfo.contactNumber || ''}`)}
                  >
                    {userInfo.contactNumber || 'N/A'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="cube-outline" size={18} color="#555" />
                  <Text style={styles.stockText}>
                    {pharmacyStock > 0 ? `${pharmacyStock} in stock` : "Out of Stock"}
                  </Text>
                  <Text style={styles.dateText}>
                    (Last updated on {medication.timeStamps ? formatDateTime(new Date(medication.timeStamps)) : 'No Date Available'})
                  </Text>
                </View>

                {/* Map View */}
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: parseFloat(pharmacy.location.latitude),
                      longitude: parseFloat(pharmacy.location.longitude),
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    showsUserLocation
                  >
                    <Marker
                      coordinate={{
                        latitude: parseFloat(pharmacy.location.latitude),
                        longitude: parseFloat(pharmacy.location.longitude),
                      }}
                      title={userInfo.name || 'Pharmacy'}
                      description={pharmacy.address || 'No address available'}
                    />
                  </MapView>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={styles.bottomSpace}></View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F4F4' },
  header: { backgroundColor: '#005b7f', paddingTop: 10, paddingBottom: 20, alignItems: 'center' },
  backButton: { position: 'absolute', top: 10, left: 20 },
  headerText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  container: { padding: 16 },
  scrollViewContent: { paddingBottom: 100 },
  pharmacyName: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 15,
    backgroundColor: '#005b7f',
    padding: 10,
    color: 'white'
  },
  infoContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 2
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoText: { marginLeft: 8, fontSize: 16, color: '#555' },
  dateText: { marginLeft: 5, fontSize: 12, color: '#555', fontStyle: 'italic' },
  stockText: { marginLeft: 8, fontSize: 16, color: 'green' },
  pharmacyContainer: { marginTop: 20, padding: 10, backgroundColor: '#005b7f', elevation: 2 },
  pharmacyTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  mapContainer: { marginTop: 20, height: 200, borderRadius: 10, overflow: 'hidden' },
  map: { flex: 1 },
  bottomSpace: { height: 50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F4F4' },
  errorText: { color: 'red', fontSize: 16 },
});

export default MedicationDetails;
