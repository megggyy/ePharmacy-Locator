import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';

const ViewPharmacyMedicine = () => {
  const router = useRouter();
  const { id, pharmacyId } = useLocalSearchParams();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStockDetails = async () => {
      try {
        const response = await axios.get(`${baseURL}medicine/read/${id}`);
        if (response.data.pharmacy._id === pharmacyId) {
          setStock(response.data);
        } else {
          setStock(null);
        }
      } catch (error) {
        console.error('Error fetching stock details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStockDetails();
  }, [id, pharmacyId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B607E" />
      </View>
    );
  }

  if (!stock) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Medicine stock not found for this pharmacy.</Text>
      </View>
    );
  }

  const { medicine, expirationPerStock, timeStamps } = stock;
  const totalStock = expirationPerStock?.reduce((sum, stockItem) => sum + stockItem.stock, 0) || 0;
  const categoryNames = medicine.category ? medicine.category.map(cat => cat.name).join(' / ') : 'No Category';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">{medicine.brandName || 'Unknown Medicine'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Medicine Details</Text>
        <View style={styles.detailRow}><Text style={styles.label}>Brand Name:</Text><Text style={styles.value}>{medicine.brandName || 'N/A'}</Text></View>
        <View style={styles.detailRow}><Text style={styles.label}>Generic Name:</Text><Text style={[styles.value, styles.wrapText]}>{medicine.genericName || 'N/A'}</Text></View>
        <View style={styles.detailRow}><Text style={styles.label}>Dosage Strength:</Text><Text style={styles.value}>{medicine.dosageStrength || 'N/A'}</Text></View>
        <View style={styles.detailRow}><Text style={styles.label}>Dosage Form:</Text><Text style={styles.value}>{medicine.dosageForm || 'N/A'}</Text></View>
        <View style={styles.detailRow}><Text style={styles.label}>Classification:</Text><Text style={styles.value}>{medicine.classification || 'N/A'}</Text></View>
        <View style={styles.detailRow}><Text style={styles.label}>Category:</Text><Text style={styles.value}>{categoryNames}</Text></View>
        <View style={styles.detailRow}><Text style={styles.label}>Stock:</Text><Text style={styles.value}>{totalStock > 0 ? `${totalStock} in stock` : 'Out of Stock'}</Text></View>
        <Text style={styles.timestamp}>Last updated on {timeStamps ? new Date(timeStamps).toLocaleString() : 'No Date Available'}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  header: {
    backgroundColor: '#005b7f',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { marginRight: 10 },
  headerText: { color: 'white', fontSize: 20, fontWeight: 'bold', flex: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#0B607E' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  label: { fontSize: 16, fontWeight: '600', color: '#333' },
  value: { fontSize: 16, color: '#555', flex: 1 },
  wrapText: { flexWrap: 'wrap' },
  timestamp: { fontSize: 12, color: 'red', marginTop: 10, textAlign: 'right' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center' },
});

export default ViewPharmacyMedicine;
