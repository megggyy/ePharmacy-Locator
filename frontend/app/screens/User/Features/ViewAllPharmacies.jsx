import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For icons
import { useRouter } from 'expo-router';

const ViewAllPharmacies = () => {
  const router = useRouter();

  return (
    <View style={styles.topContainer}>
    <View style={styles.header}>
  <TouchableOpacity  onPress={() => router.back()} style={styles.backButton}>
    <Ionicons name="arrow-back" size={24} color="white" />
  </TouchableOpacity>
  <Text style={styles.headerText}>Available Pharmacies</Text>
  {/* Header */}
  <Text style={styles.headerText}></Text>
</View>
      <ScrollView style={styles.container}>
        {/* Pharmacies Section */}
        {/* <Text style={styles.sectionTitle}>All Pharmacies</Text> */}
        <View style={styles.pharmaciesGrid}>
          {[1, 2, 3, 4, 5, 6].map((pharmacy, index) => (
            <TouchableOpacity key={index} style={styles.pharmacyCard} onPress={() => router.push('/screens/User/Features/PharmacyDetails')}>
              <Image style={styles.pharmacyImage} 
              source={require('@/assets/images/sample.jpg')}
              />
              <View>
                <Text style={styles.pharmacyName}>Pharmacy Name {index + 1}</Text>
                <Text style={styles.pharmacyAddress}>123 Main St, City {index + 1}</Text>
                <Text style={styles.barangayText}>North Signal Village</Text>
                <Text style={styles.storeHoursText}>8:00 AM - 10:00 PM</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
    topContainer: {
        flex: 1,
        backgroundColor: '#F4F4F4',
      },
    header: {
        backgroundColor: '#0B607E', // Blue header background, full width
        paddingTop: 80,
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
  safeArea: { flex: 1, backgroundColor: '#005b7f' },
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#fff' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  /* Pharmacies Grid */
  pharmaciesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pharmacyCard: { 
    width: '48%', // Two items in a row
    padding: 10,
    backgroundColor: '#fff', 
    borderRadius: 10, 
    marginVertical: 10,
    borderColor: '#B0BEC5', // Light border color
    borderWidth: 1, // Border width
  },
  pharmacyImage: { width: '100%', height: 180, borderRadius: 10, marginBottom: 10 },
  pharmacyName: { fontSize: 16, fontWeight: 'bold' },
  pharmacyAddress: {  fontSize: 12,
    color: '#666',
    marginTop: 5, },
  viewButton: {
    backgroundColor: '#005b7f',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  barangayText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  storeHoursText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});

export default ViewAllPharmacies;
