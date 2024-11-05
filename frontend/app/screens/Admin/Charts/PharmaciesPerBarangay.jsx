import React from 'react';
import { View, Text, Image, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PharmacyPieChartScreen() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  // Updated data representing the number of pharmacies per barangay
  const data = [
    { name: 'New Lower ', population: 27, color: '#0B607E', legendFontColor: '#333', legendFontSize: 15 },
    { name: 'Lower Bicutan', population: 18, color: '#A0C4FF', legendFontColor: '#333', legendFontSize: 15 },
    { name: 'South Signal', population: 11, color: '#4D7EA8', legendFontColor: '#333', legendFontSize: 15 },
    { name: 'Central Signal', population: 22, color: '#357ABD', legendFontColor: '#333', legendFontSize: 15 },
    { name: 'Hagonoy', population: 7, color: '#78C6A3', legendFontColor: '#333', legendFontSize: 15 },
    { name: 'Others', population: 15, color: '#F5F595', legendFontColor: '#333', legendFontSize: 15 },
  ];

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
        data={data}
        width={screenWidth}
        height={300} // Increased height for a larger chart
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        center={[10, 0]}
        absolute
        style={styles.chartStyle}
        withLegend={false} // Disable the default legend on the right side
      />
      
      {/* Custom Legend - Add a custom legend below the chart */}
      {/* <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.name}: {item.population}</Text>
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
