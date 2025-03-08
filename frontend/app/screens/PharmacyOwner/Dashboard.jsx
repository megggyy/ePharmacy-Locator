import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';
import AuthGlobal from '@/context/AuthGlobal';

const screenWidth = Dimensions.get("window").width;

export default function PharmacyOwnerDashboard() {
  const [totalMedications, setTotalMedications] = useState(0);
  const [medicationData, setMedicationData] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const { state } = useContext(AuthGlobal);
  const router = useRouter();
  
  useEffect(() => {
    if (state.isAuthenticated) {
        // Fetch user profile data
        axios
        .get(`${baseURL}users/${state.user.userId}`)
        .then((res) => {
          setUserProfile(res.data);
        })
        .catch((err) => {
          console.error("Error fetching user profile:", err);
        });

        axios
        .get(`${baseURL}medicine/${state.user.userId}`) // Adjust this to your actual endpoint
        .then((res) => {
          const medications = res.data;
          setTotalMedications(medications.length); // Count the medications related to this pharmacy
          // Process this data to set medication categories if needed
        })
        .catch((err) => {
          console.error("Error fetching medications:", err);
        });
         
      // Fetch the pharmacy associated with this user
      axios.get(`${baseURL}pharmacies/user/${state.user.userId}`)
        .then((res) => {
          if (res.data) {
            const pharmacyId = res.data.id; // Get the pharmacy ID
            
            // Fetch medication data using the pharmacy ID
            axios.get(`${baseURL}pharmacies/medications-per-category/${pharmacyId}`)
              .then((medRes) => {
                const categories = Object.keys(medRes.data);
                const counts = Object.values(medRes.data);

                // Transform data for PieChart
                const pieData = categories.map((category, index) => ({
                  name: category,
                  population: counts[index],
                  color: `hsl(${index * 60}, 70%, 50%)`, // Generates unique colors
                  legendFontColor: "#333",
                  legendFontSize: 11
                }));

                setMedicationData(pieData);
              })
              .catch((err) => console.error("Error fetching medication categories:", err));
          } else {
            console.error("No pharmacy found for this user.");
          }
        })
        .catch((err) => console.error("Error fetching pharmacy details:", err));
    } else {
      router.push('/login');
    }
  }, [state.isAuthenticated, state.user.userId]);


  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <StatusBar backgroundColor="#005b7f" barStyle="light-content" />  
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuIcon} onPress={() => router.push('/drawer/PharmacyOwnerDrawer')}>
          <Ionicons name="menu" size={30} color="white" />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userProfile?.name || "Loading..."}</Text>
          <Text style={styles.userRole}>Pharmacy Owner</Text>
        </View>
      </View>

      {/* Total Medications Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Total Medications</Text>
        <Text style={styles.summaryCount}>{totalMedications}</Text>
      </View>

      {/* Medications per Category Chart */}
      <Text style={styles.chartTitle}>Medications per Category</Text>
      {medicationData.length > 0 ? (
        <PieChart
          data={medicationData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#0B607E",
            backgroundGradientFrom: "#0B607E",
            backgroundGradientTo: "#0B607E",
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      ) : (
        <Text style={styles.noDataText}>No Data Available</Text>
      )}

      {/* Manage Medications Button */}
      <TouchableOpacity style={styles.manageButton} onPress={() => router.push('/screens/PharmacyOwner/Medications/ListMedications')} >
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
    paddingVertical: 10,
    backgroundColor: '#005b7f',
  },
  menuIcon: {
    marginRight: 10,
    marginTop: 0,
  },
  userInfo: {
    alignItems: 'flex-start',
    marginLeft: 10,
    marginBottom: 5,
  },
  userName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
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
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
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