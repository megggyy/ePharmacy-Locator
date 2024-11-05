import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PharmacyTableScreen() {
  const router = useRouter();
  const pharmacies = [
    { id: 1, name: 'Pharmacy', storeHours: '8:00am - 5:00pm', location: 'New Lower Bicutan', image: require('@/assets/images/sample.jpg') },
    { id: 2, name: 'Pharmacy', storeHours: '8:00am - 5:00pm', location: 'Lower Bicutan', image: require('@/assets/images/sample.jpg') },
    { id: 3, name: 'Pharmacy', storeHours: '9:00am - 10:00pm', location: 'New Lower Bicutan', image: require('@/assets/images/sample.jpg') },
    { id: 4, name: 'Pharmacy', storeHours: '8:00am - 5:00pm', location: 'South Signal Village', image: require('@/assets/images/sample.jpg') },
    { id: 5, name: 'Pharmacy', storeHours: '8:00am - 5:00pm', location: 'Central Signal Village', image: require('@/assets/images/sample.jpg') },
    { id: 6, name: 'Pharmacy', storeHours: '10:00am - 7:00am', location: 'Hagonoy', image: require('@/assets/images/sample.jpg') },
  ];

  // const handleEdit = (id) => {
  //   // Navigate to edit screen or handle edit action
  //   console.log(`Edit Pharmacy ID: ${id}`);
  //   router.push(`/screens/Admin/Pharmacies/EditPharmacy/${id}`);
  // };

  // const handleDelete = (id) => {
  //   // Handle delete action
  //   console.log(`Delete Pharmacy ID: ${id}`);
  //   // Implement delete functionality here
  // };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.row} onPress={() => router.push('/screens/Admin/Pharmacies/ReadPharmacy')}>
      <Text style={styles.cell}>{item.id}</Text>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.storeHours}</Text>
      <Text style={styles.cell}>{item.location}</Text>
      
      {/* Action Buttons (Edit and Delete) */}
      <View style={styles.actionCell}>
        <TouchableOpacity  onPress={() => router.push('/screens/Admin/Pharmacies/EditPharmacy')} style={styles.iconButton}>
        <Ionicons name="create-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton}>
        <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Image source={require('@/assets/images/epharmacy-logo.png')} style={styles.logo} />
        <Text style={styles.title}>ePharmacy</Text>
      </View>

      {/* Pharmacy Table */}
      <Text style={styles.tableTitle}>Pharmacies</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>ID</Text>
        <Text style={styles.headerCell}>Image</Text>
        <Text style={styles.headerCell}>Name</Text>
        <Text style={styles.headerCell}>Store Hours</Text>
        <Text style={styles.headerCell}>Location</Text>
        <Text style={styles.headerCell}>Actions</Text>
      </View>
      <FlatList
        data={pharmacies}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.table}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#0B607E',
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  tableTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EEEEEE',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  table: {
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    color: '#333333',
  },
  image: {
    width: 50,
    height: 50,
    resizeMode: 'cover',
    borderRadius: 5,
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
  },
  iconButton: {
    marginHorizontal: 0,
  },
});
