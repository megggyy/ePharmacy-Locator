import React from 'react';
import { View, Text, Image, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MonthlyRegistrationChartScreen() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth * 0.9; // Set the chart width to 90% of screen width

  // Example data representing monthly registrations of pharmacies
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // Months
    datasets: [
      {
        data: [5, 10, 15, 20, 25, 30, 35, 40, 30, 25, 20, 15], // Number of registrations for each month
        color: (opacity = 1) => `rgba(0, 139, 139, ${opacity})`, // Line color
        strokeWidth: 3, // Line thickness
      },
    ],
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
      <Text style={styles.chartTitle}>Monthly Registrations of Pharmacies</Text>

      {/* Line Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={data}
          width={chartWidth} // Set the width of the chart
          height={300} // Height of the chart
          chartConfig={chartConfig}
          bezier // Smooth the line
          style={styles.chartStyle}
        />
      </View>
    </View>
  );
}

const chartConfig = {
  backgroundColor: '#FFFFFF',
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  color: (opacity = 1) => `rgba(0, 139, 139, ${opacity})`, // Line color
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Label color
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
    backgroundColor: '#FFFFFF', // Background color for the chart container
    borderRadius: 10, // Rounded corners for the chart container
    padding: 15, // Padding around the chart
    shadowColor: '#000', // Shadow color for elevation effect
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 4, // Shadow blur radius
    elevation: 5, // Android elevation
    alignItems: 'center', // Center align chart
    marginHorizontal: 20, // Margin on left and right
  },
  chartStyle: {
    marginVertical: 10,
  },
});
