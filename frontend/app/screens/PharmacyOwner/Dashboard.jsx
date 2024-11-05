import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const screenWidth = Dimensions.get("window").width;

export default function PharmacyOwnerDashboard() {
  const [totalMedications, setTotalMedications] = useState(0);
  const [medicationData, setMedicationData] = useState([]);
  const router = useRouter();
  
  // Sample data: Replace this with actual data from an API or database
  useEffect(() => {
    const sampleData = [
      { category: "Antibiotics", count: 40 },
      { category: "Pain Relievers", count: 25 },
      { category: "Vitamins", count: 30 },
      { category: "Cough", count: 20 },
      { category: "Allergy", count: 15 }
    ];
    setMedicationData(sampleData);

    const totalCount = sampleData.reduce((sum, item) => sum + item.count, 0);
    setTotalMedications(totalCount);
  }, []);

  // Prepare data for the chart
  const chartData = {
    labels: medicationData.map(item => item.category),
    datasets: [
      {
        data: medicationData.map(item => item.count)
      }
    ]
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuIcon} onPress={() => router.push('/drawer/PharmacyOwnerDrawer')}>
          <Ionicons name="menu" size={30} color="white" />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Shanai Meg Honrado</Text>
          <Text style={styles.userRole}>Phawmacy Owner</Text>
        </View>
      </View>
      {/* Total Medications Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Total Medications</Text>
        <Text style={styles.summaryCount}>{totalMedications}</Text>
      </View>

      {/* Medications per Category Chart */}
      <Text style={styles.chartTitle}>Medications per Category</Text>
      <BarChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: "#0B607E",
          backgroundGradientFrom: "#0B607E",
          backgroundGradientTo: "#0B607E",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726"
          }
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
          marginHorizontal: 20,
        }}
      />

      {/* Manage Medications Button */}
      <TouchableOpacity style={styles.manageButton}>
        <Text style={styles.manageButtonText}>Manage Medications</Text>
        <Ionicons name="chevron-forward" size={24} color="white" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 30,
    backgroundColor: '#005b7f',
  },
  menuIcon: {
    marginRight: 10,
    marginTop: 35,
  },
  userInfo: {
    alignItems: 'flex-start',
    marginLeft: 10,
  },
  userName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 35,
  },
  userRole: {
    color: 'white',
    fontSize: 12,
  },
  summaryCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666',
  },
  summaryCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0B607E',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginTop: 20,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B607E',
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 30,
  },
  manageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
});
