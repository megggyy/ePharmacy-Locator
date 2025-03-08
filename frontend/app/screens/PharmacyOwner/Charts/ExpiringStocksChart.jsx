import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';
import AuthGlobal from '@/context/AuthGlobal'; 

export default function ExpiringStockScreen() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth * 0.9;
  //const [userProfile, setUserProfile] = useState({});
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pharmacyId, setPharmacyId] = useState(null);
  
  const { state } = useContext(AuthGlobal);

  useEffect(() => {
    if (state.isAuthenticated) {
      axios.get(`${baseURL}pharmacies/user/${state.user.userId}`)
        .then((res) => {
          if (res.data) {
            const pharmacyId = res.data.id;
            setPharmacyId(pharmacyId);
            
            // Fetch expiring stock data
            fetchExpiringStock(pharmacyId);
          } else {
            console.error("No pharmacy found for this user.");
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Error fetching pharmacy details:", err);
          setLoading(false);
        });
    } else {
      router.push('/login');
    }
  }, [state.isAuthenticated, state.user.userId]);

  const fetchExpiringStock = async (pharmacyId) => {
    try {
      const response = await axios.get(`${baseURL}pharmacies/expiringStock/${pharmacyId}`);
      const { expiringInWeek, expiringInMonth, expiringIn3Months, expiringIn6Months } = response.data;

      setChartData({
        labels: ['1 Week', '1 Month', '3 Months', '6 Months'],
        datasets: [
          {
            data: [expiringInWeek, expiringInMonth, expiringIn3Months, expiringIn6Months],
            colors: [
              (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
              (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
              (opacity = 1) => `rgba(255, 206, 86, ${opacity})`,
              (opacity = 1) => `rgba(75, 192, 192, ${opacity})`
            ],
          },
        ],
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching expiring stock data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B607E" />
      </View>
    );
  }

  if (!chartData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load chart data.</Text>
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
        <Text style={styles.title}>Expiring Medicines</Text>
      </View>

      {/* Chart Title */}
      <Text style={styles.chartTitle}>Stock Expiration in Time Periods</Text>

      {/* Bar Chart */}
      <View style={styles.chartContainer}>
      <BarChart
        data={chartData}
        width={chartWidth}
        height={350}
        chartConfig={chartConfig}
        fromZero
        showBarTops
        verticalLabelRotation={60}
        style={styles.chartStyle}
      />
      </View>
    </View>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  color: (opacity = 1) => `rgba(0, 139, 139, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.8,
  decimalPlaces: 0,
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 55,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  chartTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 40, // Reduced padding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  chartStyle: {
    marginVertical: 10, // Reduce margin to fit better
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});
