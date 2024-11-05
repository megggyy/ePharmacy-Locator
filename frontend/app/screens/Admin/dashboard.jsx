import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Icon library
import { LineChart, BarChart } from 'react-native-chart-kit'; // Chart library
import { Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

const AdminDashboard = () => {
  const router = useRouter();
  return (
    <ScrollView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuIcon} onPress={() => router.push('/drawer/AdminDrawer')}>
          <Ionicons name="menu" size={30} color="white" />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Shanai Meg Honrado</Text>
          <Text style={styles.userRole}>Admin</Text>
        </View>
      </View>

      {/* Dashboard Cards */}
      <View style={styles.dashboardCards}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>New Pharmacies</Text>
          <Text style={styles.cardNumber}>1000</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>New Users</Text>
          <Text style={styles.cardNumber}>500</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Scanned Prescriptions</Text>
          <Text style={styles.cardNumber}>1000</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>All Pharmacies</Text>
          <Text style={styles.cardNumber}>500</Text>
        </View>
      </View>

      {/* Bar Chart for Monthly New Users */}
      <Text style={styles.chartTitle}>Monthly New Users</Text>
      <BarChart
        data={{
          labels: ['Jan', 'Feb', 'Mar'],
          datasets: [
            {
              data: [25, 13, 21],
            },
          ],
        }}
        width={screenWidth - 30} // from react-native
        height={220}
        chartConfig={{
          backgroundColor: '#e26a00',
          backgroundGradientFrom: '#fb8c00',
          backgroundGradientTo: '#ffa726',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        style={styles.chart}
      />

      {/* Line Chart for Monthly Scanned Prescriptions */}
      <Text style={styles.chartTitle}>Monthly Scanned Prescription</Text>
      <LineChart
        data={{
          labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
          datasets: [
            {
              data: [100, 80, 45, 60, 70, 35, 85, 90, 100],
            },
          ],
        }}
        width={screenWidth - 30} // from react-native
        height={220}
        chartConfig={{
          backgroundColor: '#26872a',
          backgroundGradientFrom: '#43a047',
          backgroundGradientTo: '#66bb6a',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        style={styles.chart}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  dashboardCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
  },
  card: {
    backgroundColor: '#005b7f',
    width: '45%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardNumber: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 20,
  },
  chart: {
    marginVertical: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
});

export default AdminDashboard;
