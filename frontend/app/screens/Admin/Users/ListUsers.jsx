import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import baseURL from '@/assets/common/baseurl';

export default function UserTableScreen() {
  const router = useRouter();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch the customers from the backend
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${baseURL}users`);
        const data = await response.json();
        setUsers(data); // Set the users in state
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers(); // Call the function to fetch users
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.row} onPress={() => router.push('/screens/Admin/Users/ReadUser')}>
      <Text style={styles.cell}>{item._id}</Text>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.email}</Text>
      <Text style={styles.cell}>  {`${item.street}, ${item.barangay}, ${item.city}`} </Text>

      <Text style={styles.cell}>
        {item.customerDetails && item.customerDetails.disease
          ? item.customerDetails.disease.name
          : 'No Disease Info'}
      </Text>


      {/* Action Column */}
      <View style={styles.actionCell}>
        <TouchableOpacity onPress={() => router.push('/screens/Admin/Users/EditUser')} style={styles.actionButton}>
          <Ionicons name="create-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Image source={require('@/assets/images/epharmacy-logo.png')} style={styles.logo} />
        <Text style={styles.title}>ePharmacy</Text>
      </View>

      {/* User Table */}
      <Text style={styles.tableTitle}>Users</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>ID</Text>
        <Text style={styles.headerCell}>Image</Text>
        <Text style={styles.headerCell}>Name</Text>
        <Text style={styles.headerCell}>Birthdate</Text>
        <Text style={styles.headerCell}>Address</Text>
        <Text style={styles.headerCell}>Disease</Text> 
        <Text style={styles.headerCell}>Actions</Text>
      </View>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={item => item.id ? item.id.toString() : String(Math.random())}

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
  actionButton: {
    marginHorizontal: 0,
  },
});
