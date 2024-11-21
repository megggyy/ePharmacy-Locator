import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import baseURL from '@/assets/common/baseurl';

export default function PharmacyTableScreen() {
  const router = useRouter();
  const [pharmacies, setPharmacies] = useState([]);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const response = await fetch(`${baseURL}pharmacies`);
        const data = await response.json();
        setPharmacies(data); // Update state with fetched pharmacies
      } catch (error) {
        console.error('Error fetching pharmacies:', error);
      }
    };

    fetchPharmacies(); // Fetch pharmacies when component mounts
  }, []);

  const renderItem = ({ item }) => (
    // <TouchableOpacity style={styles.row} onPress={() => router.push('/screens/Admin/Pharmacies/ReadPharmacy')}>
    //   <Text style={styles.cell}>{item._id}</Text>
    //   <Image source={{ uri: item.image || 'https://via.placeholder.com/50' }} style={styles.image} />
    //   <Text style={styles.cell}>{item.userInfo.name}</Text>
    //   <Text style={styles.cell}>{`${item.storeHours?.start || 'N/A'} - ${item.storeHours?.end || 'N/A'}`}</Text>
    //   <Text style={styles.cell}>{`${item.userInfo.street}, ${item.userInfo.barangay}, ${item.userInfo.city}`}</Text>
      
    //   {/* Action Buttons */}
    //   <View style={styles.actionCell}>
    //     <TouchableOpacity onPress={() => router.push(`/screens/Admin/Pharmacies/EditPharmacy/${item._id}`)} style={styles.iconButton}>
    //       <Ionicons name="create-outline" size={24} color="black" />
    //     </TouchableOpacity>
    //     <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.iconButton}>
    //       <Ionicons name="trash-outline" size={24} color="red" />
    //     </TouchableOpacity>
    //   </View>
    // </TouchableOpacity>
    <TouchableOpacity style={styles.row}>
    <Image source={{ uri: item.image || 'https://via.placeholder.com/50' }} style={styles.image} />
    <Text style={styles.nameCell}>{item.userInfo.name}</Text>
    <Text style={styles.locationCell}>{`${item.userInfo.street}, ${item.userInfo.barangay}, ${item.userInfo.city}`}</Text>
    <View style={styles.actionCell}>
      <TouchableOpacity onPress={() => router.push(`/screens/Admin/Pharmacies/EditPharmacy/${item._id}`)} style={styles.iconButton}>
        <Ionicons name="create-outline" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.iconButton}>
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
      {/* <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>ID</Text>
        <Text style={styles.headerCell}>Image</Text>
        <Text style={styles.headerCell}>Name</Text>
        <Text style={styles.headerCell}>Store Hours</Text>
        <Text style={styles.headerCell}>Location</Text>
        <Text style={styles.headerCell}>Actions</Text>
      </View> */}
      <View style={styles.tableHeader}>
        <Text style={styles.imageHeaderCell}>Image</Text>
        <Text style={styles.nameHeaderCell}>Name</Text>
        <Text style={styles.locationHeaderCell}>Location</Text>
        <Text style={styles.actionsHeaderCell}>Actions</Text>
      </View>

      <FlatList
        data={pharmacies}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
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
    textAlign: 'center',
    fontWeight: 'bold',
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
    textAlign: 'center',
    color: '#333333',
  },
  imageHeaderCell: {
    flex: 0.8, // Matches the image content
    textAlign: 'center',
  },
  nameHeaderCell: {
    flex: 2, // Matches the name content
    textAlign: 'center',
  },
  locationHeaderCell: {
    flex: 3, // Matches the location content
    textAlign: 'center',
  },
  actionsHeaderCell: {
    flex: 1.5, // Matches the action buttons content
    textAlign: 'center',
  },
  image: {
    flex: 0.8,
    width: 50,
    height: 50,
    resizeMode: 'cover',
    borderRadius: 5,
  },
  nameCell: {
    flex: 2,
    textAlign: 'center',
    color: '#333333',
  },
  locationCell: {
    flex: 3,
    textAlign: 'center',
    color: '#333333',
  },
  actionCell: {
    flex: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  iconButton: {
    marginHorizontal: 5,
  },
});

