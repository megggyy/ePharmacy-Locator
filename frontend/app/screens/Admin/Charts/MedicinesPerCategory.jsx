import React, { useEffect, useState } from 'react';
import { View, Text, Image, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';

export default function MedicinePieChartScreen() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchMedicinesData = async () => {
      try {
        const response = await axios.get(`${baseURL}medicine/medicinesPerCategory`);
        const result = response.data;

        if (result.success) {
          const formattedData = result.data.map((item, index) => ({
            name: item.name || 'Unknown',
            population: item.count,
            color: getRandomColor(index),
            legendFontColor: '#333',
            legendFontSize: 12,
          }));

          setChartData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching medicines per category data:', error);
      }
    };

    fetchMedicinesData();
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
      <Text style={styles.chartTitle}>Number of medicines per category</Text>

      {/* Pie Chart */}
      <View style={styles.chartContainer}>
        <PieChart
          data={chartData}
          width={screenWidth * 0.9} // Adjust width to fit nicely within screen width
          height={300}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 0]}
          absolute
          style={styles.chartStyle}
        />
      </View>

      {/* Legend container can be placed below the chart */}
      {/* You can use this section if you want to add legends later */}
      {/* <View style={styles.legendContainer}>
        {chartData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.name}</Text>
          </View>
        ))}
      </View> */}
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
  chartTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  chartContainer: {
    flex: 1,
    justifyContent: 'flex-start', // Align chart at the top
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 20, // Added margin to create space between chart and legends
  },
  chartStyle: {
    marginVertical: 10,
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
});
