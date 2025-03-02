import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';  // Assuming baseURL is defined elsewhere

const PharmacyDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [pharmacy, setPharmacy] = useState(null);
  const [medicationData, setMedicationData] = useState([]);
  const [category, setCategory] = useState('');
  const [isCategory, setIsCategory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPharmacyDetails = async () => {
      try {
        const response = await axios.get(`${baseURL}pharmacies/${id}`);
        setPharmacy(response.data);
      } catch (error) {
        console.error("Error fetching pharmacy details:", error);
      }
    };

    const fetchMedicineStocks = async () => {
      try {
        const response = await axios.get(`${baseURL}medicine/features/${id}`);
        setMedicationData(response.data || []); // Ensure it's always an array
      } catch (error) {
        console.error("Error fetching medicine stocks:", error);
      }
    };

    const fetchData = () => {
      Promise.all([fetchPharmacyDetails(), fetchMedicineStocks()]).finally(() =>
        setLoading(false)
      );
    };

    fetchData(); // Fetch immediately when component mounts

    const interval = setInterval(fetchData, 5000); // Fetch every 30 sec

    return () => clearInterval(interval); // Cleanup on unmount
  }, [id]);

  useEffect(() => {
    if (medicationData.length > 0) {
      const firstMedicine = medicationData[0].medicine;
      if (firstMedicine?.category) {
        const newCategory = Array.isArray(firstMedicine.category)
          ? firstMedicine.category.map((cat) => cat.name).join('/ ')
          : firstMedicine.category?.name || 'No Category';

        setCategory(newCategory);
      }
    }
  }, [medicationData]);


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

  if (!pharmacy) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load pharmacy details.</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{pharmacy.userInfo.name}</Text>
      </View>

      <ScrollView>
        <View style={styles.imageContainer}>
          <Image
            style={styles.pharmacyImage}
            source={pharmacy?.images?.[0] ? { uri: pharmacy.images[0] } : require('@/assets/images/sample.jpg')}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.pharmacyName}>{pharmacy.userInfo.name}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#555" />
            <Text style={styles.infoText}>
              {`${pharmacy.userInfo.street || ''}, ${pharmacy.userInfo.barangay || ''}, ${pharmacy.userInfo.city || ''}`
                .replace(/(, )+/g, ', ').trim()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#555" />
            <Text style={styles.infoText}>{pharmacy.userInfo.contactNumber}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#555" />
            <Text style={styles.infoText}>
              {`${pharmacy.businessDays} (${pharmacy?.openingHour || 'N/A'} - ${pharmacy?.closingHour || 'N/A'})`}
            </Text>
          </View>

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
                title={pharmacy.userInfo.name}
              />
            </MapView>
          </View>

          {medicationData.length > 0 && (
            <View style={styles.pharmacyContainer}>
              <Text style={styles.pharmacyTitle}>Available Medicines</Text>
            </View>
          )}

          {medicationData.map((medication, index) => {
            const medDetails = medication.medicine || {};
            const categoryNames = medDetails.category ? medDetails.category.map(cat => cat.name).join(' / ') : 'No Category';
            const totalStock = medication.expirationPerStock?.reduce((sum, stockItem) => sum + stockItem.stock, 0) || 0;

            return (
              <View key={index} style={styles.medicineContainer}>
                <View style={styles.detailsContainer}>
                  <Text style={styles.label}>Generic Name:</Text>
                  <Text style={styles.value}>{medDetails.genericName}</Text>

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

                  <Text style={styles.label}>Stock:</Text>
                  <Text style={styles.value}>
                    {totalStock > 0 ? `${totalStock} in stock` : "Out of Stock"}
                  </Text>
                  <Text style={styles.valueT}>
                    (Last updated on {medication.timeStamps ? new Date(medication.timeStamps).toLocaleString() : 'No Date Available'})
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
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
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 2
  },
  medicineContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#005b7f',
    borderRadius: 10,
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
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
  pharmacyContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#005b7f',
    elevation: 2
  },
  pharmacyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'white',
    textAlign: 'center'
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
  valueT: {
    textAlign: 'right',
    fontSize: 12
  },
});

export default PharmacyDetails;
