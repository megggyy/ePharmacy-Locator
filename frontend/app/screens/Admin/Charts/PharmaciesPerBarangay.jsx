import React, { useEffect, useState } from 'react';
import { View, Text, Image, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';

export default function PharmacyPieChartScreen() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchPharmaciesData = async () => {
      try {
        const response = await axios.get(`${baseURL}pharmacies/pharmaciesPerBarangay`);
        const result = response.data;

        if (result.success) {
          const formattedData = result.data.map((item, index) => ({
            name: item.barangay || 'Unknown',
            population: item.count,
            color: getRandomColor(index),
            legendFontColor: '#333',
            legendFontSize: 10,
          }));

          setChartData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching pharmacies per barangay data:', error);
      }
    };

    fetchPharmaciesData();
  }, []);

  const getRandomColor = (index) => {
    const colors = [
      '#0B607E', '#A0C4FF', '#4D7EA8', '#357ABD', '#78C6A3', '#F5F595', '#F28B82', '#FFD700',
    ];
    return colors[index % colors.length];
  };

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

      {/* Chart Title */}
      <Text style={styles.chartTitle}>Number of pharmacies per barangay</Text>

      {/* Pie Chart */}
      <PieChart
        data={chartData}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        center={[10, 0]}
        absolute
        style={styles.chartStyle}
      />
    </View>
  );
}

const chartConfig = {
  backgroundColor: '#FFFFFF',
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#005b7f',
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
  chartTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColorBox: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  legendText: {
    fontSize: 14,
  },
  chartStyle: {
    marginVertical: 10,
  },
});
