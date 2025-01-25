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
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (name) {
      axios
        .get(`${baseURL}medicine/available/${name}`)
        .then((response) => {
          setMedications(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching medication details:', error);
          setLoading(false);
        });
    }
  }, [name]);

  const formatDateTime = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'long' }); // Get full month name
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
        <Text style={styles.errorText}>No medications available.</Text>
      </View>
    );
  }

  const { name: medicationName } = medications[0]; // Extract name and description from the first item

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
          const pharmacy = medication.pharmacy || {};
          const userInfo = pharmacy.userInfo || {};
          const location = pharmacy.location || {};

          return (
            <View key={index} style={styles.infoContainer}>
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
                <Text style={styles.stockText}>{medication.stock} in stock</Text>
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
            </View>
          );
        })}

        {/* Extra padding at the bottom */}
        <View style={styles.bottomSpace}></View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // styles as before
  safeArea: { flex: 1, backgroundColor: '#F4F4F4' },
  header: { backgroundColor: '#0B607E', paddingTop: 40, paddingBottom: 20, alignItems: 'center' },
  backButton: { position: 'absolute', top: 50, left: 20 },
  headerText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  container: { padding: 16 },
  scrollViewContent: { paddingBottom: 100 },
  pharmacyName: { 
    fontSize: 20, 
    textAlign: 'center', 
    marginBottom: 15, 
    backgroundColor: '#005b7f', 
    padding: 10, 
    color: 'white' },
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
  descriptionContainer: { marginTop: 0, padding: 10, backgroundColor: '#FFF', borderRadius: 8, elevation: 2 },
  descriptionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  descriptionText: { fontSize: 16, color: '#555' },
  pharmacyContainer: { marginTop: 20, padding: 10, backgroundColor: '#005b7f', elevation: 2 },
  pharmacyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: 'white', textAlign: 'center' },
  mapContainer: { marginTop: 20, height: 200, borderRadius: 10, overflow: 'hidden' },
  map: { flex: 1 },
  bottomSpace: { height: 50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F4F4' },
  errorText: { color: 'red', fontSize: 16 },
});

export default MedicationDetails;
