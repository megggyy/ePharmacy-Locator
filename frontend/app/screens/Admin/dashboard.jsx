import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  StatusBar,
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';
import AuthGlobal from '@/context/AuthGlobal';
import PulseSpinner from '@/assets/common/spinner';

const screenWidth = Dimensions.get('window').width;

const AdminDashboard = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { state } = useContext(AuthGlobal);
  const [customersData, setCustomersData] = useState({ labels: [], data: [] });
  const [counts, setCounts] = useState({
    users: 0,
    pharmacies: 0,
    categories: 0,
    medicines: 0,
  });
  const [loading, setLoading] = useState(true);
  const [scannedMedicinesData, setScannedMedicinesData] = useState({
    labels: [],
    data: [],
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          usersRes,
          pharmaciesRes,
          categoriesRes,
          medicinesRes,
          customersRes,
          scannedMedicinesRes,
        ] = await Promise.all([
          axios.get(`${baseURL}users`),
          axios.get(`${baseURL}pharmacies`),
          axios.get(`${baseURL}medication-category`),
          axios.get(`${baseURL}medicine`),
          axios.get(`${baseURL}users/customersPerMonth`),
          axios.get(`${baseURL}customers/mostScannedMedicines`),
        ]);

        setCounts({
          users: usersRes?.data?.length || 0,
          pharmacies: pharmaciesRes?.data?.length || 0,
          categories: categoriesRes?.data?.length || 0,
          medicines: medicinesRes?.data?.length || 0,
        });

        if (customersRes?.data?.success) {
          const labels =
            customersRes?.data?.getUsersPerMonth?.map((item) => item?.month) ||
            [];
          const data =
            customersRes?.data?.getUsersPerMonth?.map((item) => item?.total) ||
            [];
          setCustomersData({ labels, data });
        }

        if (scannedMedicinesRes?.data?.success) {
          const labels =
            scannedMedicinesRes?.data?.mostScannedMedicines?.map(
              (item) => item?._id
            ) || [];
          const data =
            scannedMedicinesRes?.data?.mostScannedMedicines?.map(
              (item) => item?.count
            ) || [];
          setScannedMedicinesData({ labels, data });
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    // Optional polling every ~8 minutes
    const intervalId = setInterval(() => {
      fetchAllData();
    }, 500000);

    return () => clearInterval(intervalId);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (state?.isAuthenticated === false || state?.isAuthenticated === null) {
        router.push('../screens/Auth/LoginScreen');
      }

      AsyncStorage.getItem('jwt')
        .then((res) => {
          if (!state?.user?.userId) return;
          axios
            .get(`${baseURL}users/${state?.user?.userId}`, {
              headers: { Authorization: `Bearer ${res}` },
            })
            .then((user) => setUserProfile(user?.data || {}))
            .catch((error) => console.log(error));
        })
        .catch((error) => console.log(error));

      return () => {
        setUserProfile({});
      };
    }, [state?.isAuthenticated, state?.user?.userId, router])
  );

  const topMedicines = scannedMedicinesData?.labels
    .map((label, index) => ({
      name: label,
      count: scannedMedicinesData?.data?.[index],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <PulseSpinner />
      </View>
    );
  }

  return (
    <ScrollView style={styles.safeArea}>
      <StatusBar backgroundColor="#005b7f" barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuIcon}
          onPress={() => router.push('/drawer/AdminDrawer')}
        >
          <Ionicons name="menu" size={30} color="white" />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {userProfile?.name || 'Loading...'}
          </Text>
          <Text style={styles.userRole}>Admin</Text>
        </View>
      </View>

      {/* Dashboard Cards */}
      <View style={styles.dashboardCards}>
        <View style={styles.card}>
          <Text
            style={styles.cardTitle}
            onPress={() =>
              router.push('/screens/Admin/Pharmacies/ListPharmacies')
            }
          >
            Pharmacies
          </Text>
          <Text style={styles.cardNumber}>{counts?.pharmacies || 0}</Text>
        </View>
        <View style={styles.card}>
          <Text
            style={styles.cardTitle}
            onPress={() => router.push('/screens/Admin/Users/ListUsers')}
          >
            Users
          </Text>
          <Text style={styles.cardNumber}>{counts?.users || 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Categories</Text>
          <Text style={styles.cardNumber}>{counts?.categories || 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Medicines</Text>
          <Text style={styles.cardNumber}>{counts?.medicines || 0}</Text>
        </View>
      </View>

      <Text style={styles.chartTitle}>Monthly New Customers</Text>
      <LineChart
        data={{
          labels: customersData?.labels || [],
          datasets: [
            {
              data:
                customersData?.data?.map((item) =>
                  isNaN(item) || item === Infinity ? 0 : item
                ) || [],
            },
          ],
        }}
        width={screenWidth - 30}
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

      <Text style={styles.chartTitle}>Most Scanned Medicines</Text>
      <TouchableOpacity onPress={() => setIsModalVisible(true)}>
        <BarChart
          data={{
            labels:
              scannedMedicinesData?.labels?.map((label) =>
                label?.length > 10 ? label?.substring(0, 10) + '...' : label
              ) || [],
            datasets: [
              {
                data:
                  scannedMedicinesData?.data?.map((item) =>
                    isNaN(item) ? 0 : item
                  ) || [],
              },
            ],
          }}
          width={screenWidth - 30}
          height={350}
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
      </TouchableOpacity>

      <Modal visible={isModalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
          onPress={() => setIsModalVisible(false)}
        >
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 10,
              width: screenWidth * 0.8,
            }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}
            >
              Top 5 Scanned Medicines
            </Text>

            {topMedicines?.map((med, index) => (
              <Text key={index} style={{ fontSize: 16 }}>
                {index + 1}. {med.name} ({med.count} times)
              </Text>
            ))}

            <Text
              style={{ color: 'gray', marginTop: 10, textAlign: 'center' }}
            >
              Tap anywhere to close
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: '#005b7f',
  },
  menuIcon: {
    marginRight: 10,
    marginTop: 0,
  },
  userInfo: {
    alignItems: 'flex-start',
    marginLeft: 10,
  },
  userName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 0,
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
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 220,
  },
});

export default AdminDashboard;
