
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';

const MedicineList = () => {
  const router = useRouter();
  const { pharmacyId, genericName } = useLocalSearchParams();
  const [medicine, setMedicine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [isCategory, setIsCategory] = useState({});

  useEffect(() => {
    const fetchMedicineStocks = async () => {
      try {
        const response = await axios.get(`${baseURL}medicine/list/${pharmacyId}/${genericName}`);
        console.log('Fetched medicine data:', response.data.data); // Logging fetched data
        setMedicine(response.data.data);
      } catch (error) {
        console.error('Error fetching medicine details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicineStocks();
  }, [pharmacyId, genericName]);

  useEffect(() => {
    if (medicine.length > 0) {
      const firstMedicine = medicine[0].medicine;
      if (firstMedicine?.category) {
        const newCategory = Array.isArray(firstMedicine.category)
          ? firstMedicine.category.map((cat) => cat.name).join('/ ')
          : firstMedicine.category?.name || 'No Category';

        setCategory(newCategory);
      }
    }
  }, [medicine]);


  const handleCategoryClick = (index) => {
    setIsCategory((prev) => ({
      ...prev,
      [index]: !prev[index], // Toggle only the clicked category
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B607E" />
      </View>
    );
  }

  if (!medicine.length) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load medicines in the pharmacy.</Text>
      </View>
    );
  }

  const pharmacy = medicine[0]?.pharmacy || {};
  const userInfo = pharmacy.userInfo || {};
  const location = pharmacy.location || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{userInfo.name || 'Unknown Pharmacy'}</Text>
      </View>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContent}>

        {/* Pharmacy Image */}
        <View style={styles.imageContainer}>
          <Image
            style={styles.pharmacyImage}
            source={
              pharmacy.images?.[0]
                ? { uri: pharmacy.images[0] }
                : require('@/assets/images/sample.jpg')
            }
          />
        </View>

        {/* Pharmacy Information */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#555" />
            <Text style={styles.infoText}>
              {`${userInfo.street || ''}, ${userInfo.barangay || ''}, ${userInfo.city || ''}`.replace(/(, )+/g, ', ').trim()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#555" />
            <Text style={styles.infoText}>{userInfo.contactNumber || 'No Contact Info'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#555" />
            <Text style={styles.infoText}>
              {`${pharmacy.businessDays || 'N/A'} (${pharmacy.openingHour || 'N/A'} - ${pharmacy.closingHour || 'N/A'})`}
            </Text>
          </View>

          {/* Map View */}
          {location.latitude && location.longitude ? (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: parseFloat(location.latitude),
                  longitude: parseFloat(location.longitude),
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showsUserLocation
              >
                <Marker
                  coordinate={{
                    latitude: parseFloat(location.latitude),
                    longitude: parseFloat(location.longitude),
                  }}
                  title={userInfo.name}
                />
              </MapView>
            </View>
          ) : null}
        </View>

        <View style={styles.pharmacyContainer}>
          <Text style={styles.pharmacyTitle}>Available {medicine[0]?.medicine?.genericName || 'Unknown Medicine'}</Text>
        </View>

        {medicine.map((medication, index) => {
          const medDetails = medication.medicine || {};
          const categoryNames = medDetails.category ? medDetails.category.map(cat => cat.name).join(' / ') : 'No Category';
          const totalStock = medication.expirationPerStock?.reduce((sum, stockItem) => sum + stockItem.stock, 0) || 0;

          return (
            <View key={index} style={styles.infoContainer}>
              <View style={styles.detailsContainer}>
                <Text style={styles.label}>Brand Name:</Text>
                <Text style={styles.value}>{medDetails.brandName}</Text>

                <Text style={styles.label}>Dosage Strength:</Text>
                <Text style={styles.value}>{medDetails.dosageStrength}</Text>

                <Text style={styles.label}>Dosage Form:</Text>
                <Text style={styles.value}>{medDetails.dosageForm}</Text>

                <Text style={styles.label}>Classification:</Text>
                <Text style={styles.value}>{medDetails.classification}</Text>

                <Text style={styles.label}>Category:</Text>
                <Text style={styles.value} onPress={() => handleCategoryClick(index)}>
                  {isCategory[index] ? medDetails.description || "No Description" : categoryNames || "No Category"}
                </Text>

                <Text style={styles.label}>Stock:                </Text>
                <Text style={styles.value}>
                  {totalStock > 0 ? `${totalStock} in stock` : "Out of Stock"}
                </Text>
                <Text style={styles.valueT}>(Last updated on {medication.timeStamps ? new Date(medication.timeStamps).toLocaleString() : 'No Date Available'})
                </Text>
              </View>
            </View>
          );
        })}

        <View style={styles.bottomSpace}></View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    backgroundColor: '#0B607E',
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  pharmacyImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  infoContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  pharmacyName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#555',
  },
  stockText: {
    marginLeft: 8,
    fontSize: 16,
    color: 'green',
  },
  mapContainer: {
    marginTop: 20,
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
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
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  value: {
    backgroundColor: '#F4F4F4',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 15,
    textAlign: 'justify'
  },
  valueT: {
    textAlign: 'right',
    fontSize: 12
  },
});


export default MedicineList;
