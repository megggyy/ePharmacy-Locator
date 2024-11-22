import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useSearchParams } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';

export default function ReadUserScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get user ID from the query parameter
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`${baseURL}users/${id}`);
          setUser(response.data);
        } catch (err) {
          console.error('Error fetching user details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B607E" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorMessage}>User not found!</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>User Details</Text>
      </View>

      {/* User Details */}
      <View style={styles.detailsContainer}>
        <Image
          source={user.image ? { uri: user.image } : require('@/assets/images/sample.jpg')}
          style={styles.image}
        />
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{user.name}</Text>
        <Text style={styles.label}>Contact Number:</Text>
        <Text style={styles.value}>{user.contactNumber || 'N/A'}</Text>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>
          {`${user.street}, ${user.barangay}, ${user.city}` || 'N/A'}
        </Text>
        <Text style={styles.label}>Disease:</Text>
        <Text style={styles.value}>
          {user.customerDetails?.disease?.name || 'No Disease Info'}
        </Text>
      </View>
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
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorMessage: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
