import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For icons
import { useRouter } from 'expo-router';
import TopBar from '../drawer/TopBar';

const HomeScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Include TopBar component */}
      <TopBar />

      <ScrollView style={styles.container}>
        {/* Categories Section */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categories}>
          <TouchableOpacity style={styles.categoryCard} onPress={() => router.push('../screens/User/Features/CategoryFilterMedications')}>
            <Image style={styles.categoryImage} source={require('@/assets/images/sample.jpg')} />
            <Text style={styles.categoryText}>Tablets</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard} onPress={() => router.push('../screens/User/Features/CategoryFilterMedications')}>
            <Image style={styles.categoryImage} source={require('@/assets/images/sample.jpg')} />
            <Text style={styles.categoryText}>Injections</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard} onPress={() => router.push('../screens/User/Features/CategoryFilterMedications')}>
            <Image style={styles.categoryImage} source={require('@/assets/images/sample.jpg')} />
            <Text style={styles.categoryText}>Capsules</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard}onPress={() => router.push('../screens/User/Features/CategoryFilterMedications')}>
            <Image style={styles.categoryImage} source={require('@/assets/images/sample.jpg')} />
            <Text style={styles.categoryText}>Inhalers</Text>
          </TouchableOpacity>
        </View>

        {/* Pharmacies Section */}
        <Text style={styles.sectionTitle}>Pharmacies</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity style={styles.pharmacyCard} onPress={() => router.push('/screens/User/Features/PharmacyDetails')}>
          <Image
            style={styles.pharmacyImage}
            source={require('@/assets/images/sample.jpg')}
          />
          <View style={styles.pharmacyInfo}>
            <Text style={styles.pharmacyName}>Pharmacy 1</Text>
            <Text style={styles.pharmacyLocation}>Taguig City</Text>
            <Text style={styles.storeHours}>Store Hours: 7AM - 9PM</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pharmacyCard} onPress={() => router.push('/screens/User/Features/PharmacyDetails')}>
          <Image
            style={styles.pharmacyImage}
            source={require('@/assets/images/sample.jpg')}
          />
          <View style={styles.pharmacyInfo}>
            <Text style={styles.pharmacyName}>Pharmacy 1</Text>
            <Text style={styles.pharmacyLocation}>Taguig City</Text>
            <Text style={styles.storeHours}>Store Hours: 7AM - 9PM</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pharmacyCard} onPress={() => router.push('/screens/User/Features/PharmacyDetails')}>
          <Image
            style={styles.pharmacyImage}
            source={require('@/assets/images/sample.jpg')}
          />
          <View style={styles.pharmacyInfo}>
            <Text style={styles.pharmacyName}>Pharmacy 1</Text>
            <Text style={styles.pharmacyLocation}>Taguig City</Text>
            <Text style={styles.storeHours}>Store Hours: 7AM - 9PM</Text>
          </View>
        </TouchableOpacity>
          <TouchableOpacity style={styles.pharmacyCard} onPress={() => router.push('/screens/User/Features/PharmacyDetails')}>
            <Image
              style={styles.pharmacyImage}
              source={require('@/assets/images/sample.jpg')}
            />
            <View>
              <Text style={styles.pharmacyName}>Pharmacy 2</Text>
              <Text style={styles.pharmacyLocation}>Makati City</Text>
              <Text style={styles.storeHours}>Store Hours: 7AM - 9PM</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Medications Section */}
        <Text style={styles.sectionTitle}>Medications</Text>
        {[1, 2, 3].map((product, index) => (
          <TouchableOpacity key={index} style={styles.productCard} onPress={() => router.push('/screens/User/Features/MedicationDetails')}>
            <Image style={styles.productImage} 
            source={require('@/assets/images/sample.jpg')}
            />
            <View>
              <Text style={styles.productName}>Paracetamol</Text>
              <Text style={styles.productPrice}>Stock: 90</Text>
              <Text style={styles.pharmacyInfo}>Pharmacy: Mercury Drug</Text>
              <Text style={styles.pharmacyBarangay}>Barangay: Fort Bonifacio</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#005b7f' },
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#fff' },
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },

  /* Categories */
  categories: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  categoryCard: { width: '48%', marginVertical: 10 },
  categoryImage: { width: '100%', height: 100, borderRadius: 10 },
  categoryText: { textAlign: 'center', marginTop: 5 },

  /* Pharmacies */
/* Pharmacies */
pharmacyCard: {
  flexDirection: 'row', // Change to row layout
  padding: 15,
  backgroundColor: '#fff',
  borderRadius: 10,
  marginRight: 10,
  borderWidth: 1, // Adding a border for a framed effect
  borderColor: '#ddd', // Light grey color for the border
  shadowColor: '#000', // Shadow for depth effect
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 3, // For Android shadow
  width: 300, // Doubled width
  alignItems: 'center',
},

pharmacyImage: {
  width: 100, // Reduced width for the image on the left
  height: 100, // Adjusted height to match width
  borderRadius: 10,
  marginRight: 15, // Add some space between the image and the text
},

pharmacyInfo: {
  flex: 1, // Take up remaining space for the text/info
  justifyContent: 'center', // Align text vertically
},

pharmacyName: {
  fontSize: 16,
  fontWeight: 'bold',
  textAlign: 'left', // Align text to the left
},

pharmacyLocation: {
  fontSize: 14,
  color: '#666',
  textAlign: 'left', // Align text to the left
},

  storeHours: {
    fontSize: 14,
    color: '#005b7f',
    textAlign: 'center',
    marginTop: 5,
  },

  /* Products */
  productCard: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderRadius: 10, marginVertical: 10 },
  productImage: { width: 100, height: 100, borderRadius: 10, marginRight: 10 },
  productName: { fontSize: 16, fontWeight: 'bold' },
  productPrice: { fontSize: 14, color: 'green' },
  pharmacyInfo: { fontSize: 14, color: '#666', marginTop: 5 },
  pharmacyBarangay: { fontSize: 14, color: '#666' },
});

export default HomeScreen;
